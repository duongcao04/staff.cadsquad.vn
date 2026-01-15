import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { MailService } from './mail.service'
import { SendEmailDto } from './dtos/send-mail.dto'

@Controller('email')
export class EmailController {
    constructor(private readonly mailService: MailService) {}

    @Post('send')
    @UseInterceptors(FilesInterceptor('files')) // Allows attaching files via Multipart Form Data
    async sendManualEmail(
        @Body() body: SendEmailDto,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        try {
            const { subject, to, content, cc, bcc, fromName, fromEmail } = body
            // Map uploaded files to the format MailService expects
            const attachments = files?.map((file) => ({
                filename: file.originalname,
                content: file.buffer,
                contentType: file.mimetype,
            }))

            return await this.mailService.sendEmail({
                subject,
                to,
                cc,
                bcc,
                fromName,
                fromEmail,
                content,
                // attachments,
            })
        } catch (error) {
            throw new BadRequestException(
                `Could not send email: ${error.message}`
            )
        }
    }

    /**
     * Example endpoint to trigger the Job Assignment specifically
     */
    @Post('test-job-notification')
    async testJobNotification(@Body() data: { email: string; name: string }) {
        const mockUser = { email: data.email, displayName: data.name } as any
        return await this.mailService.sendJobAssignmentNotification(
            mockUser,
            'JOB-2026-001',
            'Design Modern Villa'
        )
    }
}
