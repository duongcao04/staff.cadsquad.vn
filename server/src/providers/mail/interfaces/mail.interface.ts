export interface MailAttachment {
	filename: string
	path?: string
	content?: any
	contentType?: string
	cid?: string // Content ID cho hình ảnh nhúng (nếu cần)
}

export interface SendEmailOptions {
	to: string | string[]
	subject: string
	content: string // HTML content
	fromName?: string // Tên người gửi (Optional - sẽ lấy default nếu thiếu)
	fromEmail?: string // Email người gửi (Optional - sẽ lấy default nếu thiếu)
	cc?: string | string[]
	bcc?: string | string[]
	attachments?: MailAttachment[]
	context?: Record<string, any> // Nếu dùng template engine
	template?: string // Tên file template (nếu dùng)
}
