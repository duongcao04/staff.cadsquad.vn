declare const APP_PERMISSIONS: {
    readonly JOB: {
        readonly READ_ALL: "job.readAll";
        readonly READ_INCOME: "job.readIncome";
        readonly READ_STAFF_COST: "job.readStaffCost";
        readonly READ_CANCELLED: "job.readCancelled";
        readonly CREATE: "job.create";
        readonly UPDATE: "job.update";
        readonly DELETE: "job.delete";
        readonly PUBLISH: "job.publish";
        readonly DELIVER: "job.deliver";
        readonly REVIEW: "job.review";
        readonly ASSIGN_MEMBER: "job.assignMember";
        readonly MANAGE: "job.manage";
        readonly PAID: "job.paid";
    };
    readonly USER: {
        readonly CREATE: "user.create";
        readonly UPDATE: "user.update";
        readonly DELETE: "user.delete";
        readonly RESET_PASSWORD: "user.resetPassword";
        readonly BLOCK: "user.block";
    };
    readonly ROLE: {
        readonly MANAGE: "role.manage";
    };
    readonly DEPARTMENT: {
        readonly READ_SENSITIVE: "department.readSensitive";
        readonly CREATE: "department.create";
        readonly UPDATE: "department.update";
        readonly DELETE: "department.delete";
    };
    readonly JOB_TITLE: {
        readonly CREATE: "jobTitle.create";
        readonly UPDATE: "jobTitle.update";
        readonly DELETE: "jobTitle.delete";
    };
    readonly CLIENT: {
        readonly READ: "client.read";
        readonly WRITE: "client.write";
    };
    readonly PAYMENT_CHANNEL: {
        readonly CREATE: "payment.create";
        readonly UPDATE: "payment.update";
        readonly DELETE: "payment.delete";
    };
    readonly COMMUNITY: {
        readonly CREATE: "community.create";
    };
    readonly POST: {
        readonly CREATE: "post.create";
    };
    readonly FILE: {
        readonly READ: "file.read";
        readonly WRITE: "file.write";
    };
    readonly SYSTEM: {
        readonly MANAGE: "system.manage";
    };
    readonly JOB_TYPE: {
        readonly CREATE: "jobType.create";
        readonly UPDATE: "jobType.update";
        readonly DELETE: "jobType.delete";
    };
    readonly JOB_STATUS: {
        readonly CREATE: "jobStatus.create";
        readonly UPDATE: "jobStatus.update";
        readonly DELETE: "jobStatus.delete";
    };
    readonly FOLDER_TEMPLATE: {
        readonly CREATE: "folderTemplate.create";
        readonly UPDATE: "folderTemplate.update";
        readonly DELETE: "folderTemplate.delete";
    };
    readonly ANALYTICS: {
        readonly READ: "analytics.read";
        readonly REPORT: "analytics.report";
    };
};
/**
 * Helper Type to extract all permission strings as a Union type.
 * Usage: function check(perm: AppPermission) { ... }
 */
type AppPermission = (typeof APP_PERMISSIONS)[keyof typeof APP_PERMISSIONS][keyof (typeof APP_PERMISSIONS)[keyof typeof APP_PERMISSIONS]];

export { APP_PERMISSIONS, type AppPermission };
