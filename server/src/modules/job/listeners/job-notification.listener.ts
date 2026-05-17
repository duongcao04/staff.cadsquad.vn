import { NotificationType } from '@/generated/prisma'
import { NotificationService } from '@/modules/notification/notification.service'
import { PermissionService } from '@/modules/role-permissions/permission.service'
import { MailService } from '@/providers/mail/mail.service'
import { IMAGES, APP_PERMISSIONS } from '@/utils'
import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { JobActionEvent } from '../events/job-action.event'
import { NotificationActionDto } from '../../notification/dto/notification-action.dto'

@EventsHandler(JobActionEvent)
export class JobNotificationListener implements IEventHandler<JobActionEvent> {
	private readonly logger = new Logger(JobNotificationListener.name)

	constructor(
		private notificationService: NotificationService,
		private mailService: MailService,
		private permissionService: PermissionService
	) {}

	// 2. Đổi tên hàm thành "handle" (Bắt buộc khi implement IEventHandler)
	// CQRS EventBus mặc định xử lý sự kiện bất đồng bộ (không block luồng chính)
	async handle(event: JobActionEvent) {
		const { actionType, jobId, modifierId, payload, jobContext } = event

		try {
			switch (actionType) {
				case NotificationType.JOB_CREATED:
					await this.handleJobCreated(modifierId, jobContext)
					break
				case NotificationType.JOB_SYNCED_SHAREPOINT:
					await this.handleSyncedSharepointFolder(
						modifierId,
						jobContext
					)
					break
				case NotificationType.JOB_ASSIGNED:
					await this.handleMemberAssigned(
						modifierId,
						payload,
						jobContext
					)
					break
				case NotificationType.JOB_UPDATED:
					await this.handleCostUpdated(
						modifierId,
						payload,
						jobContext
					)
					break
				case NotificationType.JOB_UPDATED:
					await this.handleAttachmentsUpdated(
						modifierId,
						payload,
						jobContext
					)
					break
				case NotificationType.JOB_UPDATED:
					await this.handleDeadlineChanged(
						modifierId,
						payload,
						jobContext
					)
					break
				case NotificationType.JOB_APPROVED:
				case NotificationType.JOB_REJECTED:
					await this.handleDeliveryReviewed(
						modifierId,
						actionType,
						payload,
						jobContext
					)
					break
				case NotificationType.JOB_UPDATED:
					await this.handleForceStatusChange(
						modifierId,
						payload,
						jobContext
					)
					break
				case NotificationType.JOB_PAID:
					await this.handleJobPaid(modifierId, jobContext)
					break
				case NotificationType.JOB_CANCELLED:
					await this.handleJobDeleted(modifierId, jobContext)
					break
				case NotificationType.JOB_UPDATED:
					if (payload.isRevenueUpdate) {
						await this.handleRevenueUpdated(modifierId, jobContext)
					}
					break
			}
		} catch (error) {
			this.logger.error(
				`Error processing Side-Effects for Job ${jobId} [${actionType}]`,
				error
			)
		}
	}

	// =========================================================================
	// IMPLEMENTATION DETAILS (Giữ nguyên không thay đổi)
	// =========================================================================

	private async handleJobCreated(modifierId: string, job: any) {
		const jobAssignmentIds =
			job.assignments?.map((it: any) => it.userId) || []

		// 1. Notify Assignees
		if (jobAssignmentIds.length > 0) {
			const actions: NotificationActionDto[] = [
				{
					id: 'view',
					color: 'primary',
					label: 'View Detail',
					variant: 'solid',
					actionRedirect: `/jobs/${job.no}`,
				},
				{
					id: 'dismiss',
					color: 'default',
					label: 'Dismiss',
					variant: 'light',
					actionKey: 'DISMISS_ACTIONS',
				},
			]
			await this.notificationService.sendToUsers(jobAssignmentIds, {
				senderId: modifierId,
				title: `[${job.no}] New Project Assignment`,
				content: `You have been assigned to Job #${job.no}- ${job.displayName}.`,
				type: NotificationType.JOB_ASSIGNED,
				severity: 'INFO',
				actions,
				redirectUrl: `/jobs/${job.no}`,
				imageUrl:
					job.status?.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			})

			const usersForMail = job.assignments.map((it: any) => ({
				email: it.user.email,
				personalEmail: it.user.personalEmail,
				displayName: it.user.displayName,
			}))
			await this.mailService.sendJobAssignmentNotification(usersForMail, {
				no: job.no,
				displayName: job.displayName,
				clientName: job.client?.name,
				dueAt: job.dueAt,
			})
		}

		// 2. Notify Managers
		const managerIds = await this.permissionService
			.findUserHasAnyPermission([
				APP_PERMISSIONS.JOB.MANAGE,
				APP_PERMISSIONS.SYSTEM.MANAGE,
				APP_PERMISSIONS.JOB.PAID,
			])
			.then((res) => res.filter((it) => !jobAssignmentIds.includes(it)))

		if (managerIds.length > 0) {
			const actions: NotificationActionDto[] = [
				{
					id: 'view',
					color: 'primary',
					label: 'View Detail',
					variant: 'solid',
					actionRedirect: `/jobs/${job.no}`,
				},
				{
					id: 'dismiss',
					color: 'default',
					label: 'Dismiss',
					variant: 'light',
					actionKey: 'DISMISS_ACTIONS',
				},
			]
			await this.notificationService.sendToUsers(managerIds, {
				senderId: modifierId,
				actions,
				title: `[${job.no}] New Project Created`,
				content: `New project created Job #${job.no}- ${job.displayName}.`,
				type: NotificationType.JOB_ASSIGNED,
				redirectUrl: `/jobs/${job.no}`,
				imageUrl:
					job.status?.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			})
		}
	}

	private async handleSyncedSharepointFolder(modifierId: string, job: any) {
		const jobAssignmentIds =
			job.assignments?.map((it: any) => it.userId) || []

		// 1. Notify Assignees
		if (jobAssignmentIds.length > 0) {
			const actions: NotificationActionDto[] = [
				{
					id: 'view',
					color: 'primary',
					label: 'Open Sharepoint',
					variant: 'solid',
					actionRedirect: `#`,
				},
				{
					id: 'dismiss',
					color: 'default',
					label: 'Dismiss',
					variant: 'light',
					actionKey: 'DISMISS_ACTIONS',
				},
			]
			await this.notificationService.sendToUsers(jobAssignmentIds, {
				senderId: modifierId,
				title: `Synced sharepoint folder for job #${job.no}`,
				content: `You have been assigned to Job #${job.no}- ${job.displayName}.`,
				type: NotificationType.JOB_ASSIGNED,
				severity: 'INFO',
				actions,
				redirectUrl: `/jobs/${job.no}`,
				imageUrl:
					job.status?.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			})

			const usersForMail = job.assignments.map((it: any) => ({
				email: it.user.email,
				personalEmail: it.user.personalEmail,
				displayName: it.user.displayName,
			}))
			await this.mailService.sendJobAssignmentNotification(usersForMail, {
				no: job.no,
				displayName: job.displayName,
				clientName: job.client?.name,
				dueAt: job.dueAt,
			})
		}

		// 2. Notify Managers
		const managerIds = await this.permissionService
			.findUserHasAnyPermission([
				APP_PERMISSIONS.JOB.MANAGE,
				APP_PERMISSIONS.SYSTEM.MANAGE,
				APP_PERMISSIONS.JOB.PAID,
			])
			.then((res) => res.filter((it) => !jobAssignmentIds.includes(it)))

		if (managerIds.length > 0) {
			const actions: NotificationActionDto[] = [
				{
					id: 'view',
					color: 'primary',
					label: 'View Detail',
					variant: 'solid',
					actionRedirect: `/jobs/${job.no}`,
				},
				{
					id: 'dismiss',
					color: 'default',
					label: 'Dismiss',
					variant: 'light',
					actionKey: 'DISMISS_ACTIONS',
				},
			]
			await this.notificationService.sendToUsers(managerIds, {
				senderId: modifierId,
				actions,
				title: `[${job.no}] New Project Created`,
				content: `New project created Job #${job.no}- ${job.displayName}.`,
				type: NotificationType.JOB_ASSIGNED,
				redirectUrl: `/jobs/${job.no}`,
				imageUrl:
					job.status?.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			})
		}
	}

	private async handleMemberAssigned(
		modifierId: string,
		payload: any,
		job: any
	) {
		const { memberId, userEmail, userPersonalEmail, userDisplayName } =
			payload
		const actions: NotificationActionDto[] = [
			{
				id: 'view',
				color: 'primary',
				label: 'View Detail',
				variant: 'solid',
				actionRedirect: `/jobs/${job.no}`,
			},
			{
				id: 'dismiss',
				color: 'default',
				label: 'Dismiss',
				variant: 'light',
				actionKey: 'DISMISS_ACTIONS',
			},
		]
		await this.notificationService.send({
			userId: memberId,
			senderId: modifierId,
			title: `[#${job.no}] New Job Assignment`,
			content: `You have been assigned to job: ${job.no}- ${job.displayName}`,
			type: NotificationType.JOB_ASSIGNED,
			actions,
			imageUrl:
				job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			redirectUrl: `/jobs/${job.no}`,
		})

		await this.mailService.sendJobAssignmentNotification(
			[
				{
					email: userEmail,
					personalEmail: userPersonalEmail,
					displayName: userDisplayName,
				},
			],
			{
				no: job.no,
				displayName: job.displayName,
				clientName: job.client?.name,
				dueAt: job.dueAt,
			}
		)
	}

	private async handleCostUpdated(
		modifierId: string,
		payload: any,
		job: any
	) {
		await this.notificationService.send({
			userId: payload.memberId,
			senderId: modifierId,
			title: 'Staff Cost Updated',
			content: `Your cost assignment for Job #${job.no} has been updated.`,
			type: NotificationType.JOB_UPDATED,
			imageUrl:
				job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			redirectUrl: `/jobs/${job.no}`,
		})
	}

	private async handleAttachmentsUpdated(
		modifierId: string,
		payload: any,
		job: any
	) {
		if (payload.action === 'add' && job.assignments?.length > 0) {
			const assigneeIds = job.assignments.map((a: any) => a.userId)
			await this.notificationService.sendToUsers(assigneeIds, {
				senderId: modifierId,
				title: `[${job.no}] Files Updated`,
				content: `${payload.filesCount} new file(s) have been added to ${job.displayName}.`,
				type: NotificationType.JOB_UPDATED,
				imageUrl:
					job.status?.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
				redirectUrl: `/jobs/${job.no}?tab=files`,
			})
		}
	}

	private async handleDeadlineChanged(
		modifierId: string,
		payload: any,
		job: any
	) {
		const assignments = job.assignments || []
		if (assignments.length === 0) return

		const formattedDate = new Date(payload.newDueAt).toLocaleDateString(
			'en-GB',
			{
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			}
		)

		const assigneeIds = assignments.map((a: any) => a.userId)
		const actions: NotificationActionDto[] = [
			{
				id: 'view',
				color: 'primary',
				label: 'View Detail',
				variant: 'solid',
				actionRedirect: `/jobs/${job.no}`,
			},
			{
				id: 'dismiss',
				color: 'default',
				label: 'Dismiss',
				variant: 'light',
				actionKey: 'DISMISS_ACTIONS',
			},
		]
		await this.notificationService.sendToUsers(assigneeIds, {
			senderId: modifierId,
			title: `[${job.no}] Schedule Updated`,
			actions,
			content: `The deadline for Job #${job.no} has been changed to ${formattedDate}.`,
			type: NotificationType.JOB_DEADLINE_NEAR,
			imageUrl:
				job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			redirectUrl: `/jobs/${job.no}`,
		})
	}

	private async handleDeliveryReviewed(
		modifierId: string,
		actionType: NotificationType,
		payload: any,
		job: any
	) {
		const isApproved = actionType === NotificationType.JOB_APPROVED
		const assignees =
			job.assignments?.map((it: any) => ({
				id: it.user.id,
				email: it.user.email,
				displayName: it.user.displayName,
				personalEmail: it.user.personalEmail || it.user.email,
			})) || []
		const assigneeIds = assignees.map((u: any) => u.id)

		// Notify Staff
		if (assigneeIds.length > 0) {
			await this.notificationService.sendToUsers(assigneeIds, {
				senderId: modifierId,
				title: isApproved
					? `[${job.no}] Delivery Approved!`
					: `[${job.no}] Revision Required`,
				content: isApproved
					? `Your delivery for ${job.displayName} was approved.`
					: `Your delivery was rejected. Feedback: ${payload.feedback}`,
				severity: isApproved ? 'SUCCESS' : 'ERROR',
				type: 'JOB_DELIVERED',
				imageUrl:
					job.status?.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
				redirectUrl: `/jobs/${job.no}`,
			})

			if (isApproved) {
				await this.mailService.sendJobApprovedNotification(assignees, {
					no: job.no,
					displayName: job.displayName,
				})
			} else {
				await this.mailService.sendJobRejectedNotification(
					assignees,
					{ no: job.no, displayName: job.displayName },
					payload.feedback || 'Please review the comments.'
				)
			}
		}

		// Notify Managers if Approved
		if (isApproved) {
			const managerIds = await this.permissionService
				.findUserHasAnyPermission([
					APP_PERMISSIONS.JOB.MANAGE,
					APP_PERMISSIONS.SYSTEM.MANAGE,
					APP_PERMISSIONS.JOB.PAID,
				])
				.then((res) => res.filter((it) => !assigneeIds.includes(it)))

			if (managerIds.length > 0) {
				await this.notificationService.sendToUsers(managerIds, {
					senderId: modifierId,
					title: `[${job.no}] New Payout Pending`,
					content: `Job #${job.no} is completed and ready for payment.`,
					type: NotificationType.JOB_UPDATED,
					redirectUrl: `/financial/pending-payouts`,
				})
			}
		}
	}

	private async handleForceStatusChange(
		modifierId: string,
		payload: any,
		job: any
	) {
		const jobAssignmentIds =
			job.assignments?.map((it: any) => it.userId) || []
		const managerIds =
			await this.permissionService.findUserHasAnyPermission([
				APP_PERMISSIONS.JOB.MANAGE,
				APP_PERMISSIONS.SYSTEM.MANAGE,
				APP_PERMISSIONS.JOB.PAID,
			])
		const uniqueIds = [...new Set([...jobAssignmentIds, ...managerIds])]

		if (uniqueIds.length > 0) {
			await this.notificationService.sendToUsers(uniqueIds, {
				senderId: modifierId,
				title: `[${job.no}] Force Status Update`,
				content: `Job #${job.no} moved from ${payload.oldStatusName} to ${job.status.displayName}.`,
				imageUrl:
					job.status?.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
				type: NotificationType.JOB_UPDATED,
				redirectUrl: `/jobs/${job.no}`,
			})

			// Gửi email
			const recipients = payload.recipients || []
			if (recipients.length > 0) {
				await this.mailService.sendForceStatusUpdateNotification(
					recipients,
					{
						jobNo: job.no,
						jobTitle: job.displayName,
						oldStatus: payload.oldStatusName,
						newStatus: job.status.displayName,
						modifierName: 'Administrator',
					}
				)
			}
		}
	}

	private async handleJobPaid(modifierId: string, job: any) {
		const assignments = job.assignments || []
		if (assignments.length > 0) {
			const assigneeIds = assignments.map((a: any) => a.userId)
			await this.notificationService.sendToUsers(assigneeIds, {
				senderId: modifierId,
				title: `[${job.no}] Payment Confirmed`,
				content: `Your work on Job #${job.no} has been paid.`,
				type: NotificationType.JOB_PAID,
				redirectUrl: `/jobs/${job.no}`,
			})

			const usersForMail = assignments.map((it: any) => ({
				email: it.user.email,
				personalEmail: it.user.personalEmail,
				displayName: it.user.displayName,
			}))
			await this.mailService.sendJobPaidNotification(usersForMail, {
				no: job.no,
				displayName: job.displayName,
				incomeCost: job.incomeCost,
				payoutDate: job.payoutDate,
			})
		}
	}

	private async handleJobDeleted(modifierId: string, job: any) {
		const isNotTerminated = job.status?.systemType !== 'TERMINATED'
		const jobAssignmentIds =
			job.assignments?.map((it: any) => it.userId) || []

		const managerIds = await this.permissionService
			.findUserHasAnyPermission([
				APP_PERMISSIONS.JOB.MANAGE,
				APP_PERMISSIONS.SYSTEM.MANAGE,
				APP_PERMISSIONS.JOB.PAID,
			])
			.then((res) => res.filter((it) => !jobAssignmentIds.includes(it)))

		const notifData = {
			senderId: modifierId,
			title: 'Job Cancelled/Deleted',
			content: `Job #${job.no} has been removed from the system.`,
			type: NotificationType.JOB_DELETED,
			redirectUrl: `/project-center`,
		}

		if (managerIds.length > 0)
			await this.notificationService.sendToUsers(managerIds, notifData)
		if (isNotTerminated && jobAssignmentIds.length > 0) {
			await this.notificationService.sendToUsers(
				jobAssignmentIds,
				notifData
			)
		}
	}

	private async handleRevenueUpdated(modifierId: string, job: any) {
		await this.notificationService.send({
			userId: job.createdById,
			senderId: modifierId,
			title: 'Job Revenue Updated',
			content: `Financial details for Job #${job.no} have been updated.`,
			type: NotificationType.JOB_UPDATED,
			redirectUrl: `/jobs/${job.no}`,
		})
	}
}
