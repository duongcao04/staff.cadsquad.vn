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
-- Uses a sub-select to dynamically grab the correct Group ID based on the Group Code.
-- ==============================================================================================
INSERT INTO "Permission" ("id", "displayName", "code", "entity", "action", "entityAction", "description", "permissionGroupId") 
SELECT gen_random_uuid(), * FROM (VALUES 
    -- JOB EXECUTION
    ('Manage Jobs',         'JOB_MANAGE',         'JOB'::"EntityEnum", 'manage',        'job.manage',        'Provides full administrative control over all job lifecycles and configurations.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Read All Job',        'JOB_READ_ALL',       'JOB'::"EntityEnum", 'readAll',       'job.readAll',       'Allows viewing all jobs across the organization, regardless of individual assignments.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Read Income Cost',    'JOB_READ_INCOME',    'JOB'::"EntityEnum", 'readIncome',    'job.readIncome',    'Grants access to view sensitive income cost and revenue data for jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Read Staff Cost',     'JOB_READ_STAFFCOST', 'JOB'::"EntityEnum", 'readStaffCost', 'job.readStaffCost', 'Allows viewing confidential staff cost and payroll allocations for jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Read Cancelled Job',  'JOB_READ_CANCELLED', 'JOB'::"EntityEnum", 'readCancelled', 'job.readCancelled', 'Enables viewing jobs that have been marked as cancelled or terminated.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Create Jobs',         'JOB_CREATE',         'JOB'::"EntityEnum", 'create',        'job.create',        'Enables the creation and initialization of new job records.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Update Jobs',         'JOB_UPDATE',         'JOB'::"EntityEnum", 'update',        'job.update',        'Allows modifying general details, requirements, and statuses of existing jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Delete Jobs',         'JOB_DELETE',         'JOB'::"EntityEnum", 'delete',        'job.delete',        'Grants the authority to permanently delete job records from the database.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Publish Jobs',        'JOB_PUBLISH',        'JOB'::"EntityEnum", 'publish',       'job.publish',       'Allows making internal jobs visible to external portals or candidates.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Deliver Job',         'JOB_DELIVER',        'JOB'::"EntityEnum", 'deliver',       'job.deliver',       'Enables submitting completed work files and marking tasks as delivered.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Review Job',          'JOB_REVIEW',         'JOB'::"EntityEnum", 'review',        'job.review',        'Grants the authority to review, approve, or reject submitted job deliverables.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    ('Assign Member',       'JOB_ASSIGN_MEMBER',  'JOB'::"EntityEnum", 'assignMember',  'job.assignMember',  'Allows assigning or reassigning specific staff members to active jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_EXECUTION')),
    
    -- STAFF & IDENTITY
    ('Manage Role',         'ROLE_MANAGE',        'ROLE'::"EntityEnum", 'manage',       'role.manage',       'Provides full control to create, modify, and delete security roles and permissions.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_IDENTITY')),
    ('Manage Users',        'USER_MANAGE',        'USER'::"EntityEnum", 'manage',       'user.manage',       'Provides full administrative control over staff accounts and identity settings.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Create Users',        'USER_CREATE',        'USER'::"EntityEnum", 'create',       'user.create',       'Enables the creation of new staff accounts and issuing system invitations.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Update Users',        'USER_UPDATE',        'USER'::"EntityEnum", 'update',       'user.update',       'Allows modifying staff profiles, contact details, and account settings.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Delete Users',        'USER_DELETE',        'USER'::"EntityEnum", 'delete',       'user.delete',       'Grants the authority to permanently remove staff accounts from the system.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Reset Password',      'USER_RESET_PASSWORD','USER'::"EntityEnum", 'resetPassword','user.resetPassword','Allows administrators to force password resets for specific user accounts.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_IDENTITY')),
    ('Block User',          'USER_BLOCK',         'USER'::"EntityEnum", 'block',        'user.block',        'Enables suspending or revoking system access for specific staff accounts.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_IDENTITY')),
    
    -- CLIENT & FINANCE
    ('Manage Clients',      'CLIENT_MANAGE',      'CLIENT'::"EntityEnum", 'manage',     'client.manage',     'Provides full administrative control over the centralized client database.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_CLIENT')),
    ('View Clients',        'CLIENT_READ',        'CLIENT'::"EntityEnum", 'read',       'client.read',       'Allows viewing the centralized client database and related contact information.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_CLIENT')),
    ('Write Clients',       'CLIENT_WRITE',       'CLIENT'::"EntityEnum", 'write',      'client.write',      'Enables adding new clients or updating existing client profiles.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_CLIENT')),
    ('Mark Paid',           'JOB_PAID',           'JOB'::"EntityEnum",    'paid',       'job.paid',          'Grants financial authority to mark job invoices or deliverables as fully paid.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),
    ('Manage Payment',      'PAY_MANAGE',         'PAYMENT_CHANNEL'::"EntityEnum", 'manage', 'payment.manage','Provides full administrative control over banking details and payment channels.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),
    ('Create Payment',      'PAY_CREATE',         'PAYMENT_CHANNEL'::"EntityEnum", 'create', 'payment.create',  'Allows the configuration of new banking details and payment channels.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),
    ('Update Payment',      'PAY_UPDATE',         'PAYMENT_CHANNEL'::"EntityEnum", 'update', 'payment.update',  'Enables modifying existing payment channel routing and details.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),
    ('Delete Payment',      'PAY_DELETE',         'PAYMENT_CHANNEL'::"EntityEnum", 'delete', 'payment.delete',  'Grants the authority to permanently remove active payment channels.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FINANCE')),
    
    -- SOCIAL & FILES
    ('Manage Community',    'COMM_MANAGE',        'COMMUNITY'::"EntityEnum", 'manage',  'community.manage',  'Provides full administrative control over internal community groups and forums.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SOCIAL')),
    ('Create Community',    'COMM_CREATE',        'COMMUNITY'::"EntityEnum", 'create',  'community.create',  'Allows the creation of new internal community groups and forums.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SOCIAL')),
    ('Manage Post',         'POST_MANAGE',        'POST'::"EntityEnum",      'manage',  'post.manage',       'Provides full administrative control over publishing and moderating posts.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SOCIAL')),
    ('Create Post',         'POST_CREATE',        'POST'::"EntityEnum",      'create',  'post.create',       'Enables publishing new posts, announcements, and comments within communities.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SOCIAL')),
    ('Manage Files',        'FILE_MANAGE',        'FILE'::"EntityEnum",      'manage',  'file.manage',       'Provides full administrative control over centralized system files and job attachments.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FILES')),
    ('View Files',          'FILE_READ',          'FILE'::"EntityEnum",      'read',    'file.read',         'Allows browsing and downloading centralized system files and job attachments.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FILES')),
    ('Upload Files',        'FILE_WRITE',         'FILE'::"EntityEnum",      'write',   'file.write',        'Enables uploading new documents, blueprints, and assets to the file system.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_FILES')),
    
    -- SYSTEM & ORGANIZATION
    ('System Config',       'SYS_MANAGE',         'SYSTEM'::"EntityEnum",    'manage',  'system.manage',     'Grants root access to modify core system configurations and environment variables.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SYSTEM')),
    ('Manage Department',   'DEPT_MANAGE',        'DEPARTMENT'::"EntityEnum",'manage',  'department.manage', 'Provides full administrative control over the organizational structure and departments.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Read Sensitive Dept', 'DEPT_READ_SENSITIVE','DEPARTMENT'::"EntityEnum",'readSensitive', 'department.readSensitive', 'Allows viewing hidden metadata and sensitive organizational department details.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Create Department',   'DEPT_CREATE',        'DEPARTMENT'::"EntityEnum",'create',  'department.create', 'Enables defining new departments within the organizational structure.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Update Department',   'DEPT_UPDATE',        'DEPARTMENT'::"EntityEnum",'update',  'department.update', 'Allows renaming or restructuring existing company departments.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Delete Department',   'DEPT_DELETE',        'DEPARTMENT'::"EntityEnum",'delete',  'department.delete', 'Grants the authority to remove departments from the master directory.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Manage Job Title',    'TITLE_MANAGE',       'JOB_TITLE'::"EntityEnum", 'manage',  'jobTitle.manage',   'Provides full administrative control over the company job titles directory.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Create Job Title',    'TITLE_CREATE',       'JOB_TITLE'::"EntityEnum", 'create',  'jobTitle.create',   'Enables the addition of new official job titles to the company directory.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Update Job Title',    'TITLE_UPDATE',       'JOB_TITLE'::"EntityEnum", 'update',  'jobTitle.update',   'Allows modifying the definitions and details of existing job titles.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    ('Delete Job Title',    'TITLE_DELETE',       'JOB_TITLE'::"EntityEnum", 'delete',  'jobTitle.delete',   'Grants the authority to remove job titles from the master directory.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_STAFF')),
    
    -- JOB SETTINGS
    ('Manage Job Type',     'JOB_TYPE_MANAGE',    'JOB_TYPE'::"EntityEnum",  'manage',  'jobType.manage',    'Provides full administrative control over job categories and classifications.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Create Job Type',     'JOB_TYPE_CREATE',    'JOB_TYPE'::"EntityEnum",  'create',  'jobType.create',    'Enables defining new categories and classifications for jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Update Job Type',     'JOB_TYPE_UPDATE',    'JOB_TYPE'::"EntityEnum",  'update',  'jobType.update',    'Allows editing existing job type configurations and linked templates.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Delete Job Type',     'JOB_TYPE_DELETE',    'JOB_TYPE'::"EntityEnum",  'delete',  'jobType.delete',    'Grants the authority to remove job types from the system.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Manage Job Status',   'STATUS_MANAGE',      'JOB_STATUS'::"EntityEnum",'manage',  'jobStatus.manage',  'Provides full administrative control over custom workflow statuses for job lifecycles.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Create Job Status',   'STATUS_CREATE',      'JOB_STATUS'::"EntityEnum",'create',  'jobStatus.create',  'Enables configuring new custom workflow statuses for job lifecycles.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Update Job Status',   'STATUS_UPDATE',      'JOB_STATUS'::"EntityEnum",'update',  'jobStatus.update',  'Allows modifying existing job statuses, colors, and workflow sequences.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Delete Job Status',   'STATUS_DELETE',      'JOB_STATUS'::"EntityEnum",'delete',  'jobStatus.delete',  'Grants the authority to remove job statuses from the master workflow.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Manage Folder Temp',  'FOLDER_TEMPLATE_MANAGE', 'JOB_FOLDER_TEMPLATE'::"EntityEnum", 'manage', 'folderTemplate.manage', 'Grants full administrative authority to manage the configuration and lifecycle of SharePoint folder templates.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Create Folder Temp',  'FOLDER_TEMPLATE_CREATE', 'JOB_FOLDER_TEMPLATE'::"EntityEnum", 'create', 'folderTemplate.create', 'Enables the creation of new standardized SharePoint folder templates for jobs.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Update Folder Temp',  'FOLDER_TEMPLATE_UPDATE', 'JOB_FOLDER_TEMPLATE'::"EntityEnum", 'update', 'folderTemplate.update', 'Allows editing the structure and details of existing job folder templates.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    ('Delete Folder Temp',  'FOLDER_TEMPLATE_DELETE', 'JOB_FOLDER_TEMPLATE'::"EntityEnum", 'delete', 'folderTemplate.delete', 'Grants the authority to permanently remove job folder templates from the system.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_JOB_SETTINGS')),
    
    -- ANALYTICS
    ('Manage Analytics',    'ANALYTICS_MANAGE',   'ANALYTICS'::"EntityEnum", 'manage',  'analytics.manage',  'Provides full administrative control over analytical dashboards and reporting configurations.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SYSTEM')),
    ('Read Analysis',       'ANALYTICS_READ',     'ANALYTICS'::"EntityEnum", 'read',    'analytics.read',    'Allows viewing high-level system dashboards and performance metrics.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SYSTEM')),
    ('Report Analysis',     'ANALYTICS_REPORT',   'ANALYTICS'::"EntityEnum", 'report',  'analytics.report',  'Enables generating, configuring, and exporting detailed analytical reports.', (SELECT id FROM "PermissionGroup" WHERE code = 'MODULE_SYSTEM'))

) AS v(displayName, code, entity, action, entityAction, description, permissionGroupId)
ON CONFLICT ("entityAction") DO UPDATE 
SET "displayName" = EXCLUDED."displayName",
    "permissionGroupId" = EXCLUDED."permissionGroupId",
    "description" = EXCLUDED."description";

-- ==============================================================================================
-- 4. GRANT PERMISSIONS TO ROLES
-- In Prisma, the implicit mapping table is named "_PermissionToRole"
-- Column "A" refers to Permission ID, Column "B" refers to Role ID.
-- ==============================================================================================

-- 4a. ADMINISTRATOR (Gets Everything)
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT p.id, r.id 
FROM "Permission" p
CROSS JOIN "Role" r
WHERE r.code = 'admin'
ON CONFLICT DO NOTHING;

-- 4b. STAFF (Operational Day-to-Day)
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT p.id, r.id 
FROM "Permission" p
CROSS JOIN "Role" r
WHERE r.code = 'staff' AND p.code IN (
    'JOB_READ_ALL', 'JOB_CREATE', 'JOB_UPDATE', 'JOB_DELIVER', 'JOB_ASSIGN_MEMBER', 
    'CLIENT_READ', 
    'COMM_CREATE', 'POST_CREATE', 
    'FILE_READ', 'FILE_WRITE'
)
ON CONFLICT DO NOTHING;

-- 4c. ACCOUNTANT (Finance, Reporting, and View-Only Ops)
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT p.id, r.id 
FROM "Permission" p
CROSS JOIN "Role" r
WHERE r.code = 'accounting' AND p.code IN (
    'JOB_READ_ALL', 'JOB_READ_INCOME', 'JOB_READ_STAFFCOST', 'JOB_PAID',
    'CLIENT_READ', 'CLIENT_WRITE', 
    'PAY_CREATE', 'PAY_UPDATE', 'PAY_DELETE',
    'COMM_CREATE', 'POST_CREATE', 
    'FILE_READ', 'FILE_WRITE',
    'ANALYTICS_READ', 'ANALYTICS_REPORT'
)
ON CONFLICT DO NOTHING;