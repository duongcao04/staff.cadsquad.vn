import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AUDIT_LOG_KEY, AuditLogMeta } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
	private readonly logger = new Logger(AuditLogInterceptor.name);

	constructor(
		private reflector: Reflector,
		@InjectQueue('audit-logs') private readonly auditQueue: Queue, // Inject BullMQ
	) { }

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const auditMeta = this.reflector.get<AuditLogMeta>(
			AUDIT_LOG_KEY,
			context.getHandler(),
		);

		// Nếu không có decorator, cho đi qua bình thường
		if (!auditMeta) return next.handle();

		const request = context.switchToHttp().getRequest();

		// 1. Lấy thông tin WHO (Người thực hiện) & SECURITY (Bảo mật)
		const actorId = request.user?.id || null; // Giả sử bạn có AuthGuard gắn user vào request
		const ipAddress = request.ip;
		const userAgent = request.headers['user-agent'];

		// 2. Chờ Controller xử lý và bắt kết quả (Response)
		return next.handle().pipe(
			tap(async (responseData) => {
				// --- KHI API THÀNH CÔNG ---

				// Cố gắng tự động tìm targetId từ response hoặc params
				const targetId = responseData?.id || request.params?.id || null;

				// Tự động trích xuất tên/tiêu đề để hiển thị ra UI
				const targetDisplay =
					responseData?.name ||
					responseData?.title ||
					responseData?.code ||
					(targetId ? `ID: ${targetId}` : 'Hệ thống');

				// Lọc bỏ dữ liệu nhạy cảm trước khi lưu (VD: password)
				const newValues = { ...responseData };
				delete newValues.password;
				delete newValues.refreshToken;

				// Đẩy vào BullMQ
				await this.auditQueue.add('create-log', {
					actorId,
					action: auditMeta.action,
					module: auditMeta.module,
					targetId,
					targetDisplay,
					newValues,
					ipAddress,
					userAgent,
					status: 'SUCCESS',
				}, { removeOnComplete: true, removeOnFail: false }); // Cấu hình Job
			}),
			catchError((error) => {
				// --- KHI API THẤT BẠI (Bắn lỗi 400, 500...) ---
				// Vẫn ghi log lại để biết ai vừa cố làm trò gì đó mà bị lỗi!
				this.auditQueue.add('create-log', {
					actorId,
					action: auditMeta.action,
					module: auditMeta.module,
					targetId: request.params?.id || null,
					targetDisplay: 'Failed Action',
					newValues: null,
					metadata: { errorMessage: error.message }, // Lưu lại lỗi
					ipAddress,
					userAgent,
					status: 'FAILED',
				});

				throw error; // Ném lỗi trả về cho Frontend như bình thường
			}),
		);
	}
}