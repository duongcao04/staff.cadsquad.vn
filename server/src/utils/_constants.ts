export const DEFAULT_JOB_COLUMNS: {
    key: string
    label: string
    sortable: boolean
    description?: string
    visible: boolean
}[] = [
        {
            label: 'Thumbnail',
            key: 'thumbnailUrl',
            sortable: false,
            description: 'Preview image representing the project.',
            visible: true,
        },
        {
            label: 'Client',
            key: 'clientName',
            sortable: false,
            description: 'Name of the client associated with the project.',
            visible: true,
        },
        {
            label: 'Job type',
            key: 'type',
            sortable: true,
            description: 'Category or type of the job.',
            visible: true,
        },
        {
            label: 'Job no',
            key: 'no',
            sortable: true,
            description: 'Unique job or project number identifier.',
            visible: true,
        },
        {
            label: 'Job name',
            key: 'label',
            sortable: true,
            description: 'Official name or title of the job or project.',
            visible: true,
        },
        {
            label: 'Income',
            key: 'incomeCost',
            sortable: true,
            description: 'Total income or revenue generated from the project.',
            visible: true,
        },
        {
            label: 'Staff Cost',
            key: 'staffCost',
            sortable: true,
            description: 'Total cost associated with staff working on the project.',
            visible: true,
        },
        {
            label: 'Status',
            key: 'status',
            sortable: false,
            description: 'Current status of the project (e.g., Active, Completed).',
            visible: true,
        },
        {
            label: 'Due on',
            key: 'dueAt',
            sortable: true,
            description: 'Deadline or due date for the project.',
            visible: true,
        },
        {
            label: 'Attachments',
            key: 'attachmentUrls',
            sortable: false,
            description:
                'List of attached files or documents related to the project.',
            visible: true,
        },
        {
            label: 'Assignee',
            key: 'assignee',
            sortable: false,
            description: 'Person or team assigned to handle the project.',
            visible: true,
        },
        {
            label: 'Payment status',
            key: 'isPaid',
            sortable: true,
            description: 'Indicates whether the project has been paid for.',
            visible: true,
        },
        {
            label: 'Payment channel',
            key: 'paymentChannel',
            sortable: false,
            description: 'Payment method or channel used (e.g., Bank, Cash).',
            visible: true,
        },
        {
            label: 'Completed at',
            key: 'completedAt',
            sortable: true,
            description: 'Date and time when the project was completed.',
            visible: true,
        },
        {
            label: 'Created at',
            key: 'createdAt',
            sortable: true,
            description: 'Date and time when the project record was created.',
            visible: true,
        },
        {
            label: 'Modified at',
            key: 'updatedAt',
            sortable: true,
            description: 'Date and time of the most recent modification.',
            visible: true,
        },
        {
            label: 'Actions',
            key: 'action',
            sortable: false,
            description: 'Available actions such as view, edit, or delete.',
            visible: true,
        },
    ]


export const NOTIFICATION_CONTENT_TEMPLATES = {
    jobDetailUrl: "/jobs/{{jobNo}}",
    notifyAssigneeWhenChangeStatus: {
        description: "Thông báo cho member khi thay đổi status",
        url: "/jobs/{{jobNo}}",
        content: "#{{jobNo}} has been updated to {{newStatus}}. Please review the job details to stay up to date with the latest changes."
    },
    notifyAssigneeWhenPaid: {
        description: "Thông báo cho member khi thay đổi status",
        title: "{{jobNo}} has been paid.",
        url: "/jobs/{{jobNo}}",
        content: "The job #{{jobNo}} has been paid by {{paidBy}}. Please review the payment information and notify us if there are any discrepancies."
    }
}

export const IMAGES = {
    NOTIFICATION_DEFAULT_IMAGE: 'https://res.cloudinary.com/dqx1guyc0/image/upload/v1765885688/AVATAR-_Fiverr_kwcsip.png'
}