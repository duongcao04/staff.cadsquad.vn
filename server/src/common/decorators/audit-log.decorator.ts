import { SetMetadata } from '@nestjs/common';
import { SystemModule } from '../../generated/prisma';

export const AUDIT_LOG_KEY = 'audit_log_meta';

export interface AuditLogMeta {
	action: string;
	module: SystemModule;
}

export const AuditLog = (action: string, module: SystemModule) =>
	SetMetadata(AUDIT_LOG_KEY, { action, module });