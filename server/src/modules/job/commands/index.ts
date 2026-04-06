import { AssignMemberHandler } from './handlers/assign-member.handler'
import { CreateJobHandler } from './handlers/create-job.handler'
import { RemoveMemberHandler } from './handlers/remove-member.handler'
import { SoftDeleteJobHandler } from './handlers/soft-delete-job.handler'
import { UpdateAssignmentCostHandler } from './handlers/update-assignment-cost.handler'
import { UpdateJobHandler } from './handlers/update-job.handler'
import { UpdateFinancialDetailsHandler } from './handlers/update-financial-details.handler'
import { ConfirmPaymentHandler } from './handlers/confirm-payment.handler'
import { ForceChangeStatusHandler } from './handlers/force-change-status.handler'
import { ReviewDeliveryHandler } from './handlers/review-delivery.handler'
import { RestoreJobHandler } from './handlers/restore-job.handler'

export const CommandHandlers = [
	CreateJobHandler,
	AssignMemberHandler,
	RemoveMemberHandler,
	SoftDeleteJobHandler,
	UpdateAssignmentCostHandler,
	UpdateJobHandler,
	UpdateFinancialDetailsHandler,
	ConfirmPaymentHandler,
	ForceChangeStatusHandler,
	ReviewDeliveryHandler,
	RestoreJobHandler,
]

