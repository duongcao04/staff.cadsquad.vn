# Backend Tech Stack Documentation

## Tổng quan

Backend của dự án **Cadsquad Staff** được xây dựng bằng **NestJS** - một framework Node.js mạnh mẽ cho việc phát triển ứng dụng server-side. Dự án sử dụng kiến trúc module-based với TypeScript để đảm bảo type safety và maintainability.

## Công nghệ chính

### Framework & Runtime
- **NestJS 11.1.9**: Framework Node.js chính với kiến trúc modular, dependency injection, và decorators
- **Node.js**: Runtime environment
- **TypeScript 5.9.3**: Ngôn ngữ lập trình chính với type checking
- **Bun**: Runtime được sử dụng trong Docker container cho performance tốt hơn

### Database & ORM
- **PostgreSQL**: Cơ sở dữ liệu chính
- **Prisma 7.2.0**: ORM hiện đại với type-safe database access
  - Auto-generated Prisma Client
  - Database migrations
  - Schema definition với Prisma schema language

### Caching & Message Queue
- **Redis**: Caching layer sử dụng ioredis
- **BullMQ 5.66.5**: Message queue cho background jobs
  - **@bull-board/nestjs**: UI monitoring cho queues

### Authentication & Authorization
- **Passport.js**: Authentication middleware
- **JWT (@nestjs/jwt)**: JSON Web Tokens cho stateless authentication
- **Azure AD (passport-azure-ad)**: Microsoft Azure Active Directory integration
- **Better Auth (@thallesp/nestjs-better-auth)**: Enhanced authentication library

### Real-time Communication
- **Socket.io**: WebSocket implementation cho real-time features
- **Ably**: Real-time messaging platform

### External Services
- **Cloudinary**: Media storage và manipulation
- **Firebase Admin**: Push notifications và Firebase services
- **Microsoft Graph Client**: Integration với Microsoft services
- **Nodemailer**: Email sending với @nestjs-modules/mailer

### API Documentation & Validation
- **Swagger (@nestjs/swagger)**: Auto-generated API documentation
- **Class Validator**: Request validation với decorators
- **Class Transformer**: Object transformation

### Monitoring & Observability
- **Prometheus (@willsoto/nestjs-prometheus)**: Metrics collection
- **Health Checks (@nestjs/terminus)**: Application health monitoring

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Supertest**: Integration testing
- **ts-jest**: TypeScript testing support

## Cấu trúc dự án

```
server/
├── src/
│   ├── app.controller.ts      # Main application controller
│   ├── app.module.ts          # Root application module
│   ├── app.service.ts         # Main application service
│   ├── main.ts                # Application bootstrap
│   ├── common/                # Shared utilities
│   ├── config/                # Configuration files
│   ├── generated/             # Auto-generated files (Prisma client)
│   ├── lib/                   # Library utilities
│   ├── modules/               # Feature modules
│   ├── providers/             # Service providers
│   └── utils/                 # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
├── database/                  # Database seeds & migrations
├── Dockerfile                 # Container configuration
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

## Modules chính

### Core Modules
- **AuthModule**: Xử lý authentication và authorization
- **UserModule**: Quản lý users
- **RoleModule**: Quản lý roles và permissions

### Business Modules
- **JobModule**: Quản lý jobs/công việc
- **DepartmentModule**: Quản lý departments
- **NotificationModule**: Hệ thống thông báo
- **CommunityModule**: Tính năng cộng đồng
- **ClientModule**: Quản lý clients

### Infrastructure Modules
- **PrismaModule**: Database provider
- **RedisModule**: Caching provider
- **MailModule**: Email service
- **CloudinaryModule**: Media storage
- **AblyModule**: Real-time messaging

## Configuration

Ứng dụng sử dụng **@nestjs/config** cho configuration management với các config files:

- `app.config.ts`: Application settings
- `database.config.ts`: Database configuration
- `auth.config.ts`: Authentication settings
- `mail.config.ts`: Email configuration
- `azure.config.ts`: Azure AD settings
- `cloudinary.config.ts`: Cloudinary settings
- `firebase.config.ts`: Firebase settings
- `ably.config.ts`: Ably settings

## API Structure

- **Global Prefix**: `/api/v1`
- **Swagger Documentation**: `/api/docs`
- **Health Check**: `/health`
- **Metrics**: `/metrics` (Prometheus)
- **Queue Monitoring**: `/queues` (Bull Board)

## Development

### Scripts
```bash
npm run dev          # Development với watch mode
npm run build        # Build production
npm run start:prod   # Chạy production build
npm run test         # Chạy unit tests
npm run lint         # Lint code
npm run format       # Format code
```

### Environment Variables
Ứng dụng yêu cầu các environment variables sau:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection URL
- `JWT_SECRET`: JWT signing secret
- `AZURE_CLIENT_ID`: Azure AD client ID
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `ABLY_API_KEY`: Ably API key

## Deployment

### Docker
Ứng dụng được containerized với multi-stage Docker build:
- **Base stage**: Cài đặt dependencies
- **Deps stage**: Cài đặt Node.js packages
- **Builder stage**: Build TypeScript code
- **Runner stage**: Production runtime với Bun

### Production Considerations
- Sử dụng non-root user cho security
- Multi-stage build để giảm image size
- Prisma client được generate trong build process
- Environment variables được inject qua Docker args

## Performance & Scalability

- **Caching**: Redis cho session storage và data caching
- **Background Jobs**: BullMQ cho long-running tasks
- **Database Optimization**: Prisma với connection pooling
- **Monitoring**: Prometheus metrics cho observability
- **Health Checks**: Application health monitoring

## Security

- **Authentication**: Multi-provider (JWT, Azure AD)
- **Authorization**: Role-based access control
- **Input Validation**: Class-validator cho tất cả inputs
- **CORS**: Configurable CORS settings
- **Rate Limiting**: Có thể implement qua Redis
- **HTTPS**: Force HTTPS trong production

## Testing

- **Unit Tests**: Jest với ts-jest
- **Integration Tests**: Supertest cho API endpoints
- **Test Coverage**: Jest coverage reporting
- **E2E Tests**: Full application testing

## Contributing

1. Follow TypeScript best practices
2. Use ESLint và Prettier
3. Write tests cho new features
4. Update documentation khi cần
5. Use conventional commits

## Dependencies Key

### Production Dependencies
- **@nestjs/***: Core NestJS packages
- **@prisma/client**: Database client
- **ioredis**: Redis client
- **bullmq**: Message queue
- **passport**: Authentication
- **jsonwebtoken**: JWT handling
- **socket.io**: WebSockets
- **ably**: Real-time messaging
- **cloudinary**: Media storage
- **firebase-admin**: Firebase services
- **nodemailer**: Email sending

### Development Dependencies
- **typescript**: TypeScript compiler
- **eslint**: Linting
- **prettier**: Code formatting
- **jest**: Testing framework
- **prisma**: Database toolkit
- **@types/***: TypeScript type definitions</content>
<parameter name="filePath">d:/01_Projects/staff.cadsquad.vn/server/BACKEND_TECHSTACK.md