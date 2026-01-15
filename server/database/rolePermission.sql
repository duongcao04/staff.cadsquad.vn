-- rolePermission.sql

-- ==============================================================================================
-- 1. INSERT ROLES
-- Strategy: Use fixed UUIDs. Keep DO NOTHING to prevent overwriting user-defined Role names/colors.
-- ==============================================================================================
INSERT INTO "Role" ("id", "displayName", "code", "hexColor") VALUES 
('role-0000-0000-0000-0000-000000000001', 'Administrator', 'admin',      '#ef4444'),
('role-0000-0000-0000-0000-000000000002', 'Staff',         'staff',      '#3b82f6'),
('role-0000-0000-0000-0000-000000000003', 'Accountant',    'accounting', '#10b981')
ON CONFLICT ("code") DO NOTHING;


-- ==============================================================================================
-- 2. INSERT PERMISSION GROUPS (RE-GROUPED)
-- Strategy: Update logic applied to rename groups and re-order them.
-- ==============================================================================================
INSERT INTO "PermissionGroup" ("id", "displayName", "code", "order", "updatedAt") VALUES 
('group-0000-0000-0000-0000-000000000001', 'Job & Operation Management', 'GROUP_OPERATION', 1, NOW()),
('group-0000-0000-0000-0000-000000000002', 'Human Resource Management',  'GROUP_HR',        2, NOW()),
('group-0000-0000-0000-0000-000000000003', 'Finance & Client Management','GROUP_FINANCE',   3, NOW()),
('group-0000-0000-0000-0000-000000000004', 'Internal Communication',     'GROUP_SOCIAL',    4, NOW()),
('group-0000-0000-0000-0000-000000000005', 'System & Master Data',       'GROUP_SYSTEM',    5, NOW()),
('group-0000-0000-0000-0000-000000000006', 'Analytics & Reporting',      'GROUP_ANALYTICS', 6, NOW())
ON CONFLICT ("code") 
DO UPDATE SET 
    "displayName" = EXCLUDED."displayName",
    "order" = EXCLUDED."order";


-- ==============================================================================================
-- 3. INSERT PERMISSIONS (DETAILED DESCRIPTIONS & RE-GROUPING)
-- Strategy: Use DO UPDATE to apply new Descriptions and Group mappings.
-- ==============================================================================================
INSERT INTO "Permission" ("id", "displayName", "code", "entity", "action", "entityAction", "permissionGroupId", "description") VALUES 

-- === GROUP 1: JOB & OPERATION MANAGEMENT ===
(gen_random_uuid(), 'View All Jobs',        'JOB_READ_ALL',       'JOB'::"EntityEnum", 'readAll',       'job.readAll',       'group-0000-0000-0000-0000-000000000001', 'Access to view the complete list of jobs, including those not explicitly assigned to the user.'),
(gen_random_uuid(), 'View Sensitive Data',  'JOB_READ_SENSITIVE', 'JOB'::"EntityEnum", 'readSensitive', 'job.readSensitive', 'group-0000-0000-0000-0000-000000000001', 'Permission to view sensitive job data such as salary ranges, internal costs, and profit margins.'),
(gen_random_uuid(), 'Create Jobs',          'JOB_CREATE',         'JOB'::"EntityEnum", 'create',        'job.create',        'group-0000-0000-0000-0000-000000000001', 'Ability to initialize and create new job entries in the system.'),
(gen_random_uuid(), 'Update Jobs',          'JOB_UPDATE',         'JOB'::"EntityEnum", 'update',        'job.update',        'group-0000-0000-0000-0000-000000000001', 'Ability to modify existing job details, requirements, and statuses.'),
(gen_random_uuid(), 'Delete Jobs',          'JOB_DELETE',         'JOB'::"EntityEnum", 'delete',        'job.delete',        'group-0000-0000-0000-0000-000000000001', 'Authority to permanently remove job entries from the system.'),
(gen_random_uuid(), 'Publish Jobs',         'JOB_PUBLISH',        'JOB'::"EntityEnum", 'publish',       'job.publish',       'group-0000-0000-0000-0000-000000000001', 'Ability to make a job visible to the public or external candidates.'),
(gen_random_uuid(), 'Deliver Jobs',         'JOB_DELIVER',        'JOB'::"EntityEnum", 'deliver',       'job.deliver',       'group-0000-0000-0000-0000-000000000001', 'Ability to mark a job or task as completed and submit deliverables.'),
(gen_random_uuid(), 'Review Jobs',          'JOB_REVIEW',         'JOB'::"EntityEnum", 'review',        'job.review',        'group-0000-0000-0000-0000-000000000001', 'Authority to approve or reject submitted deliverables from staff.'),
(gen_random_uuid(), 'Assign Member',        'JOB_ASSIGN_MEMBER',  'JOB'::"EntityEnum", 'assignMember',  'job.assignMember',  'group-0000-0000-0000-0000-000000000001', 'Ability to assign specific staff members or teams to a job.'),

-- === GROUP 2: HUMAN RESOURCE MANAGEMENT ===
(gen_random_uuid(), 'Create Users',         'USER_CREATE',        'USER'::"EntityEnum", 'create',        'user.create',        'group-0000-0000-0000-0000-000000000002', 'Ability to invite new staff members or create user accounts.'),
(gen_random_uuid(), 'Update Users',         'USER_UPDATE',        'USER'::"EntityEnum", 'update',        'user.update',        'group-0000-0000-0000-0000-000000000002', 'Ability to edit staff profiles, contact information, and details.'),
(gen_random_uuid(), 'Delete Users',         'USER_DELETE',        'USER'::"EntityEnum", 'delete',        'user.delete',        'group-0000-0000-0000-0000-000000000002', 'Authority to remove user accounts from the system.'),
(gen_random_uuid(), 'Reset Password',       'USER_RESET_PASSWORD','USER'::"EntityEnum", 'resetPassword', 'user.resetPassword', 'group-0000-0000-0000-0000-000000000002', 'Administrative capability to force a password reset for a specific user.'),
(gen_random_uuid(), 'Block User',           'USER_BLOCK',         'USER'::"EntityEnum", 'block',         'user.block',         'group-0000-0000-0000-0000-000000000002', 'Authority to temporarily ban or block a user from accessing the system.'),
(gen_random_uuid(), 'Manage Role',          'ROLE_MANAGE',        'ROLE'::"EntityEnum", 'manage',        'role.manage',        'group-0000-0000-0000-0000-000000000002', 'High-level authority to create roles and configure permission sets.'),

-- === GROUP 3: FINANCE & CLIENT MANAGEMENT ===
(gen_random_uuid(), 'View Clients',         'CLIENT_READ',        'CLIENT'::"EntityEnum", 'read',        'client.read',        'group-0000-0000-0000-0000-000000000003', 'Access to view client database and contact information.'),
(gen_random_uuid(), 'Manage Clients',       'CLIENT_WRITE',       'CLIENT'::"EntityEnum", 'write',       'client.write',       'group-0000-0000-0000-0000-000000000003', 'Ability to create new client profiles or update existing client data.'),
(gen_random_uuid(), 'Mark Paid',            'JOB_PAID',           'JOB'::"EntityEnum",    'paid',        'job.paid',           'group-0000-0000-0000-0000-000000000003', 'Financial authority to mark a job invoice as fully paid.'),
(gen_random_uuid(), 'Create Payment Channel','PAY_CREATE',        'PAYMENT_CHANNEL'::"EntityEnum", 'create', 'payment.create', 'group-0000-0000-0000-0000-000000000003', 'Ability to configure new payment methods or banking channels.'),
(gen_random_uuid(), 'Update Payment Channel','PAY_UPDATE',        'PAYMENT_CHANNEL'::"EntityEnum", 'update', 'payment.update', 'group-0000-0000-0000-0000-000000000003', 'Ability to modify payment channel details.'),
(gen_random_uuid(), 'Delete Payment Channel','PAY_DELETE',        'PAYMENT_CHANNEL'::"EntityEnum", 'delete', 'payment.delete', 'group-0000-0000-0000-0000-000000000003', 'Authority to remove payment channels.'),

-- === GROUP 4: INTERNAL COMMUNICATION ===
(gen_random_uuid(), 'Create Community',     'COMM_CREATE',        'COMMUNITY'::"EntityEnum", 'create',   'community.create',   'group-0000-0000-0000-0000-000000000004', 'Ability to start new internal communities or groups.'),
(gen_random_uuid(), 'Create Post',          'POST_CREATE',        'POST'::"EntityEnum",      'create',   'post.create',        'group-0000-0000-0000-0000-000000000004', 'Ability to publish posts, announcements, or updates to the feed.'),

-- === GROUP 5: SYSTEM & MASTER DATA ===
-- Files
(gen_random_uuid(), 'View Files',           'FILE_READ',          'FILE'::"EntityEnum",   'read',        'file.read',          'group-0000-0000-0000-0000-000000000005', 'Access to browse and view uploaded files in the system.'),
(gen_random_uuid(), 'Upload Files',         'FILE_WRITE',         'FILE'::"EntityEnum",   'write',       'file.write',         'group-0000-0000-0000-0000-000000000005', 'Ability to upload documents and assets to storage.'),
(gen_random_uuid(), 'System Config',        'SYS_MANAGE',         'SYSTEM'::"EntityEnum", 'manage',      'system.manage',      'group-0000-0000-0000-0000-000000000005', 'Root access to modify core system configurations and environment variables.'),

-- Departments (Master Data)
(gen_random_uuid(), 'Read Sensitive Dept',  'DEPT_READ_SENSITIVE','DEPARTMENT'::"EntityEnum", 'readSensitive', 'department.readSensitive', 'group-0000-0000-0000-0000-000000000005', 'View hidden or sensitive department metadata.'),
(gen_random_uuid(), 'Create Department',    'DEPT_CREATE',        'DEPARTMENT'::"EntityEnum", 'create',        'department.create',        'group-0000-0000-0000-0000-000000000005', 'Define new organizational departments.'),
(gen_random_uuid(), 'Update Department',    'DEPT_UPDATE',        'DEPARTMENT'::"EntityEnum", 'update',        'department.update',        'group-0000-0000-0000-0000-000000000005', 'Modify existing department structures.'),
(gen_random_uuid(), 'Delete Department',    'DEPT_DELETE',        'DEPARTMENT'::"EntityEnum", 'delete',        'department.delete',        'group-0000-0000-0000-0000-000000000005', 'Remove departments from master data.'),

-- Job Titles (Master Data)
(gen_random_uuid(), 'Create Job Title',     'TITLE_CREATE',       'JOB_TITLE'::"EntityEnum", 'create',    'jobTitle.create',    'group-0000-0000-0000-0000-000000000005', 'Define new official job titles/positions.'),
(gen_random_uuid(), 'Update Job Title',     'TITLE_UPDATE',       'JOB_TITLE'::"EntityEnum", 'update',    'jobTitle.update',    'group-0000-0000-0000-0000-000000000005', 'Modify existing job title definitions.'),
(gen_random_uuid(), 'Delete Job Title',     'TITLE_DELETE',       'JOB_TITLE'::"EntityEnum", 'delete',    'jobTitle.delete',    'group-0000-0000-0000-0000-000000000005', 'Remove job titles from master data.'),

-- Job Types (Master Data)
(gen_random_uuid(), 'Create Job Type',      'JOB_TYPE_CREATE',    'JOB_TYPE'::"EntityEnum",  'create',    'jobType.create',     'group-0000-0000-0000-0000-000000000005', 'Define new categories or types of jobs.'),
(gen_random_uuid(), 'Update Job Type',      'JOB_TYPE_UPDATE',    'JOB_TYPE'::"EntityEnum",  'update',    'jobType.update',     'group-0000-0000-0000-0000-000000000005', 'Modify job type definitions.'),
(gen_random_uuid(), 'Delete Job Type',      'JOB_TYPE_DELETE',    'JOB_TYPE'::"EntityEnum",  'delete',    'jobType.delete',     'group-0000-0000-0000-0000-000000000005', 'Remove job types from master data.'),

-- Job Statuses (Master Data)
(gen_random_uuid(), 'Create Job Status',    'STATUS_CREATE',      'JOB_STATUS'::"EntityEnum", 'create',   'jobStatus.create',   'group-0000-0000-0000-0000-000000000005', 'Define new progression statuses for jobs.'),
(gen_random_uuid(), 'Update Job Status',    'STATUS_UPDATE',      'JOB_STATUS'::"EntityEnum", 'update',   'jobStatus.update',   'group-0000-0000-0000-0000-000000000005', 'Modify job status workflows.'),
(gen_random_uuid(), 'Delete Job Status',    'STATUS_DELETE',      'JOB_STATUS'::"EntityEnum", 'delete',   'jobStatus.delete',   'group-0000-0000-0000-0000-000000000005', 'Remove job statuses from master data.'),

-- === GROUP 6: ANALYTICS & REPORTING ===
(gen_random_uuid(), 'Read Analysis',        'ANALYTICS_READ',     'ANALYTICS'::"EntityEnum", 'read',      'analytics.read',     'group-0000-0000-0000-0000-000000000006', 'Access to view dashboards and general performance metrics.'),
(gen_random_uuid(), 'Report Analysis',      'ANALYTICS_REPORT',   'ANALYTICS'::"EntityEnum", 'report',    'analytics.report',   'group-0000-0000-0000-0000-000000000006', 'Ability to generate, export, and configure deep-dive analytical reports.')

ON CONFLICT ("entityAction") 
DO UPDATE SET 
    "displayName" = EXCLUDED."displayName",
    "permissionGroupId" = EXCLUDED."permissionGroupId",
    "description" = EXCLUDED."description";


-- ==============================================================================================
-- 4. MAP PERMISSIONS TO ROLES
-- Strategy: Fill if link does not exist.
-- ==============================================================================================

-- A. ADMIN: Gets ALL permissions
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT id, 'role-0000-0000-0000-0000-000000000001' FROM "Permission"
ON CONFLICT DO NOTHING;

-- B. STAFF: Gets Basic Operational Permissions
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT id, 'role-0000-0000-0000-0000-000000000002' FROM "Permission"
WHERE "entityAction" IN (
    -- Jobs (Basic)
    'job.read', 'job.create', 'job.update', 'job.deliver', 
    -- User (Self-view implied)
    'user.read',
    -- CRM
    'client.read',
    -- Social
    'community.read', 'post.create',
    -- System
    'file.read', 'file.write',
    -- View lookups (Titles, Depts, Types, Statuses)
    'department.read', 'jobTitle.read', 'jobType.read', 'jobStatus.read'
)
ON CONFLICT DO NOTHING;

-- C. ACCOUNTANT: Gets Finance & Read-Only Access
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT id, 'role-0000-0000-0000-0000-000000000003' FROM "Permission"
WHERE "entityAction" IN (
    -- Job Access
    'job.read', 'job.readAll', 'job.readSensitive', 'job.paid',
    -- Client Access
    'client.read', 'client.write',
    -- Payment Access (Granular)
    'payment.read', 'payment.readAll', 'payment.create', 'payment.update', 'payment.delete',
    -- Analytics
    'analytics.read','analytics.report'
)
ON CONFLICT DO NOTHING;