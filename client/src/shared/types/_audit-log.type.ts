import { z } from 'zod';
import { AuditLogSchema } from '../../lib/validationSchemas';

export type TAuditLog = z.infer<typeof AuditLogSchema>;