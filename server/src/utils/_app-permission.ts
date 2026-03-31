export const APP_PERMISSIONS = {
	"JOB": {
		"MANAGE": "job.manage",
		"READ_ALL": "job.readAll",
		"READ_INCOME": "job.readIncome",
		"READ_STAFF_COST": "job.readStaffCost",
		"READ_CANCELLED": "job.readCancelled",
		"CREATE": "job.create",
		"UPDATE": "job.update",
		"DELETE": "job.delete",
		"PUBLISH": "job.publish",
		"DELIVER": "job.deliver",
		"REVIEW": "job.review",
		"ASSIGN_MEMBER": "job.assignMember",
		"PAID": "job.paid"
	},
	"USER": {
		"MANAGE": "user.manage",
		"CREATE": "user.create",
		"UPDATE": "user.update",
		"DELETE": "user.delete",
		"RESET_PASSWORD": "user.resetPassword",
		"BLOCK": "user.block"
	},
	"ROLE": {
		"MANAGE": "role.manage"
	},
	"DEPARTMENT": {
		"MANAGE": "department.manage",
		"READ_SENSITIVE": "department.readSensitive",
		"CREATE": "department.create",
		"UPDATE": "department.update",
		"DELETE": "department.delete"
	},
	"JOB_TITLE": {
		"MANAGE": "jobTitle.manage",
		"CREATE": "jobTitle.create",
		"UPDATE": "jobTitle.update",
		"DELETE": "jobTitle.delete"
	},
	"CLIENT": {
		"MANAGE": "client.manage",
		"READ": "client.read",
		"WRITE": "client.write"
	},
	"PAYMENT_CHANNEL": {
		"MANAGE": "payment.manage",
		"CREATE": "payment.create",
		"UPDATE": "payment.update",
		"DELETE": "payment.delete"
	},
	"COMMUNITY": {
		"MANAGE": "community.manage",
		"CREATE": "community.create"
	},
	"POST": {
		"MANAGE": "post.manage",
		"CREATE": "post.create"
	},
	"FILE": {
		"MANAGE": "file.manage",
		"READ": "file.read",
		"WRITE": "file.write"
	},
	"SYSTEM": {
		"MANAGE": "system.manage"
	},
	"JOB_TYPE": {
		"MANAGE": "jobType.manage",
		"CREATE": "jobType.create",
		"UPDATE": "jobType.update",
		"DELETE": "jobType.delete"
	},
	"JOB_STATUS": {
		"MANAGE": "jobStatus.manage",
		"CREATE": "jobStatus.create",
		"UPDATE": "jobStatus.update",
		"DELETE": "jobStatus.delete"
	},
	"FOLDER_TEMPLATE": {
		"MANAGE": "folderTemplate.manage",
		"CREATE": "folderTemplate.create",
		"UPDATE": "folderTemplate.update",
		"DELETE": "folderTemplate.delete"
	},
	"ANALYTICS": {
		"MANAGE": "analytics.manage",
		"READ": "analytics.read",
		"REPORT": "analytics.report"
	}
};

// Trích xuất type từ cấu trúc của APP_PERMISSIONS
export type AppPermissionsType = typeof APP_PERMISSIONS;

// Lấy ra union type của tất cả các string permission (ex: "job.create" | "user.manage" | ...)
export type AppPermission =
	AppPermissionsType[keyof AppPermissionsType][keyof AppPermissionsType[keyof AppPermissionsType]];