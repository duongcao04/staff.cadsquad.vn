import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config' // Import ConfigService
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationError } from 'class-validator'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/exceptions/http-exception-filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	// 1. Lấy ConfigService
	const configService = app.get(ConfigService)

	// 2. Lấy các biến từ namespace 'app' (được định nghĩa trong app.config.ts)
	const port = configService.get<number>('app.BACKEND_PORT') || 8080
	const clientUrl = configService.get<string>('app.CLIENT_URL')
	const apiPrefix = configService.get<string>('app.API_ENDPOINT') || '/api'
	const appTitle =
		configService.get<string>('app.APP_TITLE') || 'Cadsquad Nestjs'
	const appVersion = configService.get<string>('app.APP_VERSION') || 'v1.0'

	// 3. Setup Global Prefix (lấy từ config luôn cho chuẩn)
	app.setGlobalPrefix(apiPrefix + '/v1')

	// 4. Setup CORS
	app.enableCors({
		origin: clientUrl, // Dùng biến từ config (đã validate url)
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	})

	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: (validationErrors: ValidationError[] = []) => {
				return new BadRequestException(validationErrors)
			},
			validationError: {
				target: false,
			},
			stopAtFirstError: true,
		})
	)
	app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()))

	app.useGlobalFilters(new HttpExceptionFilter())

	// 5. Swagger Setup
	const config = new DocumentBuilder()
		.addBearerAuth()
		.setTitle(appTitle)
		.setDescription('Api Documentation for Backend Service')
		.setVersion(appVersion)
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api/docs', app, document)

	// 6. Start Server
	await app.listen(port, () => {
		console.log(`>>> App running on port:::${port}`)
		console.log(`>>> Checking Client URL:::${clientUrl}`)
	})
}
void bootstrap()
