import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { BYPASS_KEY } from '../decorators/bypass.decorator'

export interface Response<T> {
    message: string
    result?: T
    timestamp?: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    constructor(private reflector: Reflector) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<Response<T>> {
        // 1. Check for the @BypassTransform decorator
        const bypass = this.reflector.getAllAndOverride<boolean>(BYPASS_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        // 2. If the decorator exists, return the stream as-is (do not wrap)
        if (bypass) {
            return next.handle()
        }

        return next.handle().pipe(
            map((result) => ({
                success: true,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                // stauts: context.switchToHttp().getResponse().statusCode,
                message:
                    this.reflector.get<string>(
                        'response_message',
                        context.getHandler()
                    ) || '',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                result,
                timestamp: new Date().toISOString(),
            }))
        )
    }
}
