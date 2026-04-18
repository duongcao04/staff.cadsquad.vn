-- ==============================================================================================
-- 1. INSERT PERMISSION GROUPS
-- ==============================================================================================
INSERT INTO "PermissionGroup" ("id", "displayName", "code", "order", "updatedAt") VALUES
(gen_random_uuid(), 'Identity Control', 'MODULE_IDENTITY', 1, now()),
(gen_random_uuid(), 'Staff Directory', 'MODULE_STAFF', 2, now()),
(gen_random_uuid(), 'Client Hub', 'MODULE_CLIENT', 3, now()),
(gen_random_uuid(), 'Financials', 'MODULE_FINANCE', 4, now()),
(gen_random_uuid(), 'Job Settings', 'MODULE_JOB_SETTINGS', 5, now()),
(gen_random_uuid(), 'Job Execution', 'MODULE_JOB_EXECUTION', 6, now()),
(gen_random_uuid(), 'Social Hub', 'MODULE_SOCIAL', 7, now()),
(gen_random_uuid(), 'File System', 'MODULE_FILES', 8, now()),
(gen_random_uuid(), 'System Tracking', 'MODULE_SYSTEM', 9, now())
ON CONFLICT ("code") DO UPDATE 
SET "displayName" = EXCLUDED."displayName", 
    "order" = EXCLUDED."order", 
    "updatedAt" = now();

-- ==============================================================================================
-- 2. INSERT ROLES
-- ==============================================================================================
INSERT INTO "Role" ("id", "displayName", "code", "hexColor") VALUES 
('role-0000-0000-0000-0000-000000000001', 'Administrator', 'admin',      '#ef4444'),
('role-0000-0000-0000-0000-000000000002', 'Staff',         'staff',      '#3b82f6'),
('role-0000-0000-0000-0000-000000000003', 'Accountant',    'accounting', '#10b981')
ON CONFLICT ("code") DO UPDATE 
SET "displayName" = EXCLUDED."displayName", 
    "hexColor" = EXCLUDED."hexColor";

-- ==============================================================================================
-- 3. INSERT PERMISSIONS
-- ==============================================================================================
INSERT INTO "Permission" ("id", "displayName", "code", "entity", "action", "entityAction", "description", "permissionGroupId") 
SELECT gen_random_uuid(), * FROM (VALUES 

    -- JOB EXECUTION
    ('Manage Jobs',         'JOB_MANAGE',              'JOB'::"EntityEnum", 'manage',          'job.manage',          'Provides full administrative control over all job lifecycles and configurations.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Read All Job',        'JOB_READ_ALL',            'JOB'::"EntityEnum", 'readAll',         'job.readAll',         'Allows viewing all jobs across the organization.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Read Income Cost',    'JOB_READ_INCOME',         'JOB'::"EntityEnum", 'readIncome',      'job.readIncome',      'View income and revenue data.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Read Staff Cost',     'JOB_READ_STAFFCOST',      'JOB'::"EntityEnum", 'readStaffCost',   'job.readStaffCost',   'View staff cost allocations.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Read Cancelled Job',  'JOB_READ_CANCELLED',      'JOB'::"EntityEnum", 'readCancelled',   'job.readCancelled',   'View cancelled jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Create Jobs',         'JOB_CREATE',              'JOB'::"EntityEnum", 'create',          'job.create',          'Create new jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Update Jobs',         'JOB_UPDATE',              'JOB'::"EntityEnum", 'update',          'job.update',          'Update job details.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Delete Jobs',         'JOB_DELETE',              'JOB'::"EntityEnum", 'delete',          'job.delete',          'Delete jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Publish Jobs',        'JOB_PUBLISH',             'JOB'::"EntityEnum", 'publish',         'job.publish',         'Publish jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Deliver Job',         'JOB_DELIVER',             'JOB'::"EntityEnum", 'deliver',         'job.deliver',         'Deliver job outputs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Review Job',          'JOB_REVIEW',              'JOB'::"EntityEnum", 'review',          'job.review',          'Review deliverables.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Assignment',          'JOB_ASSIGNMENT',          'JOB'::"EntityEnum", 'assignment',      'job.assignment',      'Assign or reassign staff to jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Update Financial',    'JOB_UPDATE_FINANCIAL',    'JOB'::"EntityEnum", 'updateFinancial', 'job.updateFinancial', 'Update cost, revenue, pricing.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),

    -- STAFF & IDENTITY
    ('Manage Role',         'ROLE_MANAGE',        'ROLE'::"EntityEnum", 'manage', 'role.manage', 'Manage roles.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_IDENTITY')),
    ('Manage Users',        'USER_MANAGE',        'USER'::"EntityEnum", 'manage', 'user.manage', 'Manage users.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Create Users',        'USER_CREATE',        'USER'::"EntityEnum", 'create', 'user.create', 'Create users.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Update Users',        'USER_UPDATE',        'USER'::"EntityEnum", 'update', 'user.update', 'Update users.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Delete Users',        'USER_DELETE',        'USER'::"EntityEnum", 'delete', 'user.delete', 'Delete users.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Reset Password',      'USER_RESET_PASSWORD','USER'::"EntityEnum", 'resetPassword', 'user.resetPassword', 'Reset password.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_IDENTITY')),
    ('Block User',          'USER_BLOCK',         'USER'::"EntityEnum", 'block', 'user.block', 'Block user.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_IDENTITY')),

    -- CLIENT & FINANCE
    ('Manage Clients',      'CLIENT_MANAGE', 'CLIENT'::"EntityEnum", 'manage', 'client.manage', 'Manage clients.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_CLIENT')),
    ('View Clients',        'CLIENT_READ',   'CLIENT'::"EntityEnum", 'read',   'client.read',   'View clients.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_CLIENT')),
    ('Write Clients',       'CLIENT_WRITE',  'CLIENT'::"EntityEnum", 'write',  'client.write',  'Write clients.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_CLIENT')),
    ('Mark Paid',           'JOB_PAID',      'JOB'::"EntityEnum", 'paid', 'job.paid', 'Mark job paid.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),
    ('Manage Payment',      'PAY_MANAGE',    'PAYMENT_CHANNEL'::"EntityEnum", 'manage', 'payment.manage', 'Manage payment.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),
    ('Create Payment',      'PAY_CREATE',    'PAYMENT_CHANNEL'::"EntityEnum", 'create', 'payment.create', 'Create payment.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),
    ('Update Payment',      'PAY_UPDATE',    'PAYMENT_CHANNEL'::"EntityEnum", 'update', 'payment.update', 'Update payment.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),
    ('Delete Payment',      'PAY_DELETE',    'PAYMENT_CHANNEL'::"EntityEnum", 'delete', 'payment.delete', 'Delete payment.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),

    -- SOCIAL & FILES
    ('Manage Community', 'COMM_MANAGE', 'COMMUNITY'::"EntityEnum", 'manage', 'community.manage', 'Manage community.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SOCIAL')),
    ('Create Community', 'COMM_CREATE', 'COMMUNITY'::"EntityEnum", 'create', 'community.create', 'Create community.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SOCIAL')),
    ('Manage Post',      'POST_MANAGE', 'POST'::"EntityEnum", 'manage', 'post.manage', 'Manage post.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SOCIAL')),
    ('Create Post',      'POST_CREATE', 'POST'::"EntityEnum", 'create', 'post.create', 'Create post.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SOCIAL')),
    ('Manage Files',     'FILE_MANAGE', 'FILE'::"EntityEnum", 'manage', 'file.manage', 'Manage files.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FILES')),
    ('View Files',       'FILE_READ',   'FILE'::"EntityEnum", 'read',   'file.read',   'View files.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FILES')),
    ('Upload Files',     'FILE_WRITE',  'FILE'::"EntityEnum", 'write',  'file.write',  'Upload files.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FILES')),

    -- SYSTEM
    ('System Config', 'SYS_MANAGE', 'SYSTEM'::"EntityEnum", 'manage', 'system.manage', 'System config.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SYSTEM')),

    -- ANALYTICS
    ('Manage Analytics', 'ANALYTICS_MANAGE', 'ANALYTICS'::"EntityEnum", 'manage', 'analytics.manage', 'Manage analytics.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SYSTEM')),
    ('Read Analysis',    'ANALYTICS_READ',   'ANALYTICS'::"EntityEnum", 'read',   'analytics.read',   'View analytics.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SYSTEM')),
    ('Report Analysis',  'ANALYTICS_REPORT', 'ANALYTICS'::"EntityEnum", 'report', 'analytics.report', 'Export reports.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SYSTEM'))

) AS v(displayName, code, entity, action, entityAction, description, permissionGroupId)
ON CONFLICT ("entityAction") DO UPDATE
SET
    "displayName" = EXCLUDED."displayName",
    "code" = EXCLUDED."code",
    "entity" = EXCLUDED."entity",
    "action" = EXCLUDED."action",
    "entityAction" = EXCLUDED."entityAction",
    "description" = EXCLUDED."description",
    "permissionGroupId" = EXCLUDED."permissionGroupId";

-- ==============================================================================================
-- ADDITIONS: JOB TITLE & JOB TYPE PERMISSIONS
-- ==============================================================================================
INSERT INTO "Permission" ("id", "displayName", "code", "entity", "action", "entityAction", "description", "permissionGroupId") 
SELECT gen_random_uuid(), * FROM (VALUES 

    -- JOB TITLE (MODULE_STAFF)
    ('Manage Job Titles', 'TITLE_MANAGE', 'JOB_TITLE'::"EntityEnum", 'manage', 'jobTitle.manage', 'Manage all job titles.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Create Job Title',  'TITLE_CREATE', 'JOB_TITLE'::"EntityEnum", 'create', 'jobTitle.create', 'Define new official job titles/positions.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Update Job Title',  'TITLE_UPDATE', 'JOB_TITLE'::"EntityEnum", 'update', 'jobTitle.update', 'Modify existing job title definitions.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Delete Job Title',  'TITLE_DELETE', 'JOB_TITLE'::"EntityEnum", 'delete', 'jobTitle.delete', 'Remove job titles from master data.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),

    -- JOB TYPE (MODULE_JOB_SETTINGS)
    ('Manage Job Types', 'JOB_TYPE_MANAGE', 'JOB_TYPE'::"EntityEnum", 'manage', 'jobType.manage', 'Manage all job types.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Create Job Type',  'JOB_TYPE_CREATE', 'JOB_TYPE'::"EntityEnum", 'create', 'jobType.create', 'Define new categories or types of jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Update Job Type',  'JOB_TYPE_UPDATE', 'JOB_TYPE'::"EntityEnum", 'update', 'jobType.update', 'Modify job type definitions.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Delete Job Type',  'JOB_TYPE_DELETE', 'JOB_TYPE'::"EntityEnum", 'delete', 'jobType.delete', 'Remove job types from master data.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS'))

) AS v(displayName, code, entity, action, entityAction, description, permissionGroupId)
ON CONFLICT ("entityAction") DO UPDATE
SET
    "displayName" = EXCLUDED."displayName",
    "code" = EXCLUDED."code",
    "entity" = EXCLUDED."entity",
    "action" = EXCLUDED."action",
    "entityAction" = EXCLUDED."entityAction",
    "description" = EXCLUDED."description",
    "permissionGroupId" = EXCLUDED."permissionGroupId";

-- ==============================================================================================
-- 4. GRANT PERMISSIONS
-- ==============================================================================================

-- ADMIN
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT p.id, r.id 
FROM "Permission" p
CROSS JOIN "Role" r
WHERE r.code = 'admin'
ON CONFLICT DO NOTHING;

-- STAFF
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT p.id, r.id 
FROM "Permission" p
CROSS JOIN "Role" r
WHERE r.code = 'staff' AND p.code IN (
    'JOB_READ_ALL', 'JOB_CREATE', 'JOB_UPDATE', 'JOB_DELIVER', 'JOB_ASSIGNMENT',
    'CLIENT_READ',
    'COMM_CREATE', 'POST_CREATE',
    'FILE_READ', 'FILE_WRITE'
)
ON CONFLICT DO NOTHING;

-- ACCOUNTANT
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT p.id, r.id 
FROM "Permission" p
CROSS JOIN "Role" r
WHERE r.code = 'accounting' AND p.code IN (
    'JOB_READ_ALL', 'JOB_READ_INCOME', 'JOB_READ_STAFFCOST', 'JOB_PAID', 'JOB_UPDATE_FINANCIAL',
    'CLIENT_READ', 'CLIENT_WRITE',
    'PAY_CREATE', 'PAY_UPDATE', 'PAY_DELETE',
    'FILE_READ', 'FILE_WRITE',
    'ANALYTICS_READ', 'ANALYTICS_REPORT'
)
ON CONFLICT DO NOTHING;