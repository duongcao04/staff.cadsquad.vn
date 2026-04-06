import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { FinancialController } from './financial.controller';

@Module({
	imports: [
		CqrsModule,
		PrismaModule,
	],
	controllers: [FinancialController],
	providers: [
		...CommandHandlers,
		...QueryHandlers,
	],
})
export class FinancialModule { }