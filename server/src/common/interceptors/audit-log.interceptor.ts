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
		const auditMeta = this.reflector.get<AuditLogMeta>(AUDIT_LOG_KEY, context.getHandler());
		if (!auditMeta) return next.handle();

		const request = context.switchToHttp().getRequest();

		const actorId = request.user.sub || null;
		const ipAddress = request.ip;
		const userAgent = request.headers['user-agent'];

		return next.handle().pipe(
			tap(async (responseData) => {
				// ƯU TIÊN: Lấy từ request['auditTargetId'] hoặc request['targetId'] nếu Controller có gán
				const targetId = request['auditTargetId'] || request['targetId'] || responseData?.id || request.params?.id || null;

				// ƯU TIÊN: Lấy từ request['targetDisplay'] nếu Controller có gán thủ công
				const targetDisplay =
					request['auditTargetDisplay'] ||
					responseData?.displayName ||
					responseData?.title ||
					responseData?.code ||
					(targetId ? `ID: ${targetId}` : 'No target');

				// Lấy metadata bổ sung từ Controller nếu có
				const customMetadata = request['auditMetadata'] || {};

				const newValues = { ...responseData };
				delete newValues.password;
				delete newValues.refreshToken;

				await this.auditQueue.add('create-log', {
					actorId,
					action: auditMeta.action,
					module: auditMeta.module,
					targetId,
					targetDisplay,
					newValues,
					ipAddress,
					userAgent,
					metadata: customMetadata,
					status: 'SUCCESS',
				}, { removeOnComplete: true });
			}),
			catchError((error) => {
				// Đối với lỗi, cũng ưu tiên lấy targetDisplay từ request nếu đã được gán trước khi crash
				this.auditQueue.add('create-log', {
					actorId,
					action: auditMeta.action,
					module: auditMeta.module,
					targetId: request['targetId'] || request.params?.id || null,
					targetDisplay: request['auditTargetDisplay'] || 'Failed Action',
					newValues: null,
					metadata: {
						errorMessage: error.message,
						...(request['auditMetadata'] || {})
					},
					ipAddress,
					userAgent,
					status: 'FAILED',
				});
				throw error;
			}),
		);
	}
}