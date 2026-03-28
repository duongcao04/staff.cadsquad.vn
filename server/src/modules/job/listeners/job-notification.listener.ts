import { ActivityType, NotificationType } from '@/generated/prisma';
import { NotificationService } from '@/modules/notification/notification.service';
import { PermissionService } from '@/modules/role-permissions/permission.service';
import { MailService } from '@/providers/mail/mail.service';
import { IMAGES } from '@/utils';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APP_PERMISSIONS } from '@staff-cadsquad/shared';
import { JobActionEvent } from '../events/job-action.event';

@Injectable()
export class JobNotificationListener {
    private readonly logger = new Logger(JobNotificationListener.name);

    constructor(
        private notificationService: NotificationService,
        private mailService: MailService,
        private permissionService: PermissionService,
    ) { }

    // Lắng nghe sự kiện (async: true giúp chạy nền, không block API response)
    @OnEvent('job.action', { async: true })
    async handleJobAction(event: JobActionEvent) {
        const { actionType, jobId, modifierId, payload, jobContext } = event;

        try {
            switch (actionType) {
                case ActivityType.CREATE_JOB:
                    await this.handleJobCreated(modifierId, jobContext);
                    break;
                case ActivityType.ASSIGN_MEMBER:
                    await this.handleMemberAssigned(modifierId, payload, jobContext);
                    break;
                case ActivityType.UNASSIGN_MEMBER:
                    await this.handleMemberRemoved(modifierId, payload, jobContext);
                    break;
                case ActivityType.UPDATE_MEMBER_COST:
                    await this.handleCostUpdated(modifierId, payload, jobContext);
                    break;
                case ActivityType.UPDATE_ATTACHMENTS:
                    await this.handleAttachmentsUpdated(modifierId, payload, jobContext);
                    break;
                case ActivityType.RESCHEDULE:
                    await this.handleDeadlineChanged(modifierId, payload, jobContext);
                    break;
                case ActivityType.APPROVE:
                case ActivityType.REJECT:
                    await this.handleDeliveryReviewed(modifierId, actionType, payload, jobContext);
                    break;
                case ActivityType.FORCE_CHANGE_STATUS:
                    await this.handleForceStatusChange(modifierId, payload, jobContext);
                    break;
                case ActivityType.PAID:
                    await this.handleJobPaid(modifierId, jobContext);
                    break;
                case ActivityType.DELETE:
                    await this.handleJobDeleted(modifierId, jobContext);
                    break;
                case ActivityType.UPDATE_GENERAL_INFORMATION:
                    if (payload.isRevenueUpdate) {
                        await this.handleRevenueUpdated(modifierId, jobContext);
                    }
                    break;
            }
        } catch (error) {
            this.logger.error(`Error processing Side-Effects for Job ${jobId} [${actionType}]`, error);
        }
    }

    // =========================================================================
    // IMPLEMENTATION DETAILS
    // =========================================================================

    private async handleJobCreated(modifierId: string, job: any) {
        const jobAssignmentIds = job.assignments?.map((it: any) => it.userId) || [];

        // 1. Notify Assignees
        if (jobAssignmentIds.length > 0) {
            await this.notificationService.sendToUsers(jobAssignmentIds, {
                senderId: modifierId,
                title: `[${job.no}] New Project Assignment`,
                content: `You have been assigned to Job #${job.no}- ${job.displayName}.`,
                type: NotificationType.JOB_ASSIGNED_MEMBER,
                redirectUrl: `/jobs/${job.no}`,
                imageUrl: job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
            });

            const usersForMail = job.assignments.map((it: any) => ({
                email: it.user.email,
                personalEmail: it.user.personalEmail,
                displayName: it.user.displayName,
            }));
            await this.mailService.sendJobAssignmentNotification(usersForMail, {
                no: job.no,
                displayName: job.displayName,
                clientName: job.client?.name,
                dueAt: job.dueAt,
            });
        }

        // 2. Notify Managers
        const managerIds = await this.permissionService.findUserHasAnyPermission([
            APP_PERMISSIONS.JOB.MANAGE, APP_PERMISSIONS.SYSTEM.MANAGE, APP_PERMISSIONS.JOB.PAID,
        ]).then((res) => res.filter((it) => !jobAssignmentIds.includes(it)));

        if (managerIds.length > 0) {
            await this.notificationService.sendToUsers(managerIds, {
                senderId: modifierId,
                title: `[${job.no}] New Project Created`,
                content: `New project created Job #${job.no}- ${job.displayName}.`,
                type: NotificationType.JOB_ASSIGNED_MEMBER,
                redirectUrl: `/jobs/${job.no}`,
                imageUrl: job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
            });
        }
    }

    private async handleMemberAssigned(modifierId: string, payload: any, job: any) {
        const { memberId, userEmail, userPersonalEmail, userDisplayName } = payload;

        await this.notificationService.send({
            userId: memberId,
            senderId: modifierId,
            title: `[#${job.no}] New Job Assignment`,
            content: `You have been assigned to job: ${job.no}- ${job.displayName}`,
            type: NotificationType.JOB_ASSIGNED_MEMBER,
            imageUrl: job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
            redirectUrl: `/jobs/${job.no}`,
        });

        await this.mailService.sendJobAssignmentNotification([{
            email: userEmail, personalEmail: userPersonalEmail, displayName: userDisplayName
        }], {
            no: job.no, displayName: job.displayName, clientName: job.client?.name, dueAt: job.dueAt
        });
    }

    private async handleMemberRemoved(modifierId: string, payload: any, job: any) {
        await this.notificationService.send({
            userId: payload.memberId,
            senderId: modifierId,
            title: `[${job.no}] Job Assignment Update`,
            content: `You have been removed from job #${job.no}- ${job.displayName}.`,
            type: NotificationType.JOB_ASSIGNED_MEMBER,
            imageUrl: job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
            redirectUrl: `/project-center`,
        });
    }

    private async handleCostUpdated(modifierId: string, payload: any, job: any) {
        await this.notificationService.send({
            userId: payload.memberId,
            senderId: modifierId,
            title: 'Staff Cost Updated',
            content: `Your cost assignment for Job #${job.no} has been updated.`,
            type: NotificationType.JOB_UPDATE,
            imageUrl: job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
            redirectUrl: `/jobs/${job.no}`,
        });
    }

    private async handleAttachmentsUpdated(modifierId: string, payload: any, job: any) {
        if (payload.action === 'add' && job.assignments?.length > 0) {
            const assigneeIds = job.assignments.map((a: any) => a.userId);
            await this.notificationService.sendToUsers(assigneeIds, {
                senderId: modifierId,
                title: `[${job.no}] Files Updated`,
                content: `${payload.filesCount} new file(s) have been added to ${job.displayName}.`,
                type: NotificationType.JOB_UPDATE,
                imageUrl: job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
                redirectUrl: `/jobs/${job.no}?tab=files`,
            });
        }
    }

    private async handleDeadlineChanged(modifierId: string, payload: any, job: any) {
        const assignments = job.assignments || [];
        if (assignments.length === 0) return;

        const formattedDate = new Date(payload.newDueAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
        });

        const assigneeIds = assignments.map((a: any) => a.userId);
        await this.notificationService.sendToUsers(assigneeIds, {
            senderId: modifierId,
            title: `[${job.no}] Schedule Updated`,
            content: `The deadline for Job #${job.no} has been changed to ${formattedDate}.`,
            type: NotificationType.JOB_DEADLINE_REMINDER,
            imageUrl: job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
            redirectUrl: `/jobs/${job.no}`,
        });
    }

    private async handleDeliveryReviewed(modifierId: string, actionType: ActivityType, payload: any, job: any) {
        const isApproved = actionType === ActivityType.APPROVE;
        const assignees = job.assignments?.map((it: any) => ({
            id: it.user.id,
            email: it.user.email,
            displayName: it.user.displayName,
            personalEmail: it.user.personalEmail || it.user.email,
        })) || [];
        const assigneeIds = assignees.map((u: any) => u.id);

        // Notify Staff
        if (assigneeIds.length > 0) {
            await this.notificationService.sendToUsers(assigneeIds, {
                senderId: modifierId,
                title: isApproved ? `[${job.no}] Delivery Approved!` : `[${job.no}] Revision Required`,
                content: isApproved ? `Your delivery for ${job.displayName} was approved.` : `Your delivery was rejected. Feedback: ${payload.feedback}`,
                type: isApproved ? NotificationType.SUCCESS : NotificationType.WARNING,
                imageUrl: job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
                redirectUrl: `/jobs/${job.no}`,
            });

            if (isApproved) {
                await this.mailService.sendJobApprovedNotification(assignees, { no: job.no, displayName: job.displayName });
            } else {
                await this.mailService.sendJobRejectedNotification(assignees, { no: job.no, displayName: job.displayName }, payload.feedback || 'Please review the comments.');
            }
        }

        // Notify Managers if Approved
        if (isApproved) {
            const managerIds = await this.permissionService.findUserHasAnyPermission([
                APP_PERMISSIONS.JOB.MANAGE, APP_PERMISSIONS.SYSTEM.MANAGE, APP_PERMISSIONS.JOB.PAID,
            ]).then((res) => res.filter((it) => !assigneeIds.includes(it)));

            if (managerIds.length > 0) {
                await this.notificationService.sendToUsers(managerIds, {
                    senderId: modifierId,
                    title: `[${job.no}] New Payout Pending`,
                    content: `Job #${job.no} is completed and ready for payment.`,
                    type: NotificationType.JOB_UPDATE,
                    redirectUrl: `/financial/pending-payouts`,
                });
            }
        }
    }

    private async handleForceStatusChange(modifierId: string, payload: any, job: any) {
        const jobAssignmentIds = job.assignments?.map((it: any) => it.userId) || [];
        const managerIds = await this.permissionService.findUserHasAnyPermission([
            APP_PERMISSIONS.JOB.MANAGE, APP_PERMISSIONS.SYSTEM.MANAGE, APP_PERMISSIONS.JOB.PAID,
        ]);
        const uniqueIds = [...new Set([...jobAssignmentIds, ...managerIds])];

        if (uniqueIds.length > 0) {
            await this.notificationService.sendToUsers(uniqueIds, {
                senderId: modifierId,
                title: `[${job.no}] Force Status Update`,
                content: `Job #${job.no} moved from ${payload.oldStatusName} to ${job.status.displayName}.`,
                imageUrl: job.status?.thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
                type: NotificationType.JOB_UPDATE,
                redirectUrl: `/jobs/${job.no}`,
            });

            // Gửi email
            const recipients = payload.recipients || []; // Nên pass danh sách recipients (email, displayName) từ Service qua payload để giảm query DB
            if (recipients.length > 0) {
                await this.mailService.sendForceStatusUpdateNotification(recipients, {
                    jobNo: job.no,
                    jobTitle: job.displayName,
                    oldStatus: payload.oldStatusName,
                    newStatus: job.status.displayName,
                    modifierName: 'Administrator',
                });
            }
        }
    }

    private async handleJobPaid(modifierId: string, job: any) {
        const assignments = job.assignments || [];
        if (assignments.length > 0) {
            const assigneeIds = assignments.map((a: any) => a.userId);
            await this.notificationService.sendToUsers(assigneeIds, {
                senderId: modifierId,
                title: `[${job.no}] Payment Confirmed`,
                content: `Your work on Job #${job.no} has been paid.`,
                type: NotificationType.JOB_PAID,
                redirectUrl: `/jobs/${job.no}`,
            });

            const usersForMail = assignments.map((it: any) => ({
                email: it.user.email,
                personalEmail: it.user.personalEmail,
                displayName: it.user.displayName,
            }));
            await this.mailService.sendJobPaidNotification(usersForMail, {
                no: job.no,
                displayName: job.displayName,
                incomeCost: job.incomeCost,
                paidAt: job.paidAt,
            });
        }
    }

    private async handleJobDeleted(modifierId: string, job: any) {
        const isNotTerminated = job.status?.systemType !== 'TERMINATED';
        const jobAssignmentIds = job.assignments?.map((it: any) => it.userId) || [];

        const managerIds = await this.permissionService.findUserHasAnyPermission([
            APP_PERMISSIONS.JOB.MANAGE, APP_PERMISSIONS.SYSTEM.MANAGE, APP_PERMISSIONS.JOB.PAID,
        ]).then((res) => res.filter((it) => !jobAssignmentIds.includes(it)));

        const notifData = {
            senderId: modifierId,
            title: 'Job Cancelled/Deleted',
            content: `Job #${job.no} has been removed from the system.`,
            type: NotificationType.JOB_DELETED,
            redirectUrl: `/project-center`,
        };

        if (managerIds.length > 0) await this.notificationService.sendToUsers(managerIds, notifData);
        if (isNotTerminated && jobAssignmentIds.length > 0) {
            await this.notificationService.sendToUsers(jobAssignmentIds, notifData);
        }
    }

    private async handleRevenueUpdated(modifierId: string, job: any) {
        await this.notificationService.send({
            userId: job.createdById,
            senderId: modifierId,
            title: 'Job Revenue Updated',
            content: `Financial details for Job #${job.no} have been updated.`,
            type: NotificationType.JOB_UPDATE,
            redirectUrl: `/jobs/${job.no}`,
        });
    }
}