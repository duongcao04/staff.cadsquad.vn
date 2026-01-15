import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const status = exception.getStatus()
        const exceptionResponse = exception.getResponse()

        // Default error structure
        let message: string | string[] = 'An unexpected error occurred'
        let errorName = 'Internal Server Error'

        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse
        } else if (
            typeof exceptionResponse === 'object' &&
            exceptionResponse !== null
        ) {
            const rawMessage = (exceptionResponse as any).message
            errorName = (exceptionResponse as any).error || exception.name

            if (Array.isArray(rawMessage)) {
                // Map the array of objects to an array of strings
                message = rawMessage.map((err) => {
                    if (typeof err === 'object' && err.constraints) {
                        // Extract the first validation message from constraints
                        return Object.values(err.constraints)[0] as string
                    }
                    return String(err)
                })
            } else if (typeof rawMessage === 'string') {
                message = rawMessage
            }
        }

        response.status(status).json({
            success: false,
            message, // returns string OR string[]
            error: errorName,
            timestamp: new Date().toISOString(),
        })
    }
}