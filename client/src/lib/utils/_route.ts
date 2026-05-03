import { envConfig } from '../config'

export const EXTERNAL_URLS = {
    getJobDetailUrl: (jobNo: string, locale?: string) => {
        if (!locale) return envConfig.APP_URL + '/' + 'jobs' + '/' + jobNo
        return envConfig.APP_URL + '/' + locale + '/' + 'jobs' + '/' + jobNo
    },
} as const
export const INTERNAL_URLS = {
    home: '/',
    workbench: '/',
    projectCenter: '/project-center',
    userSchedule: '/schedule',
    jobDetail: (jobNo: string) => `/jobs/${jobNo}`,
    profile: '/profile',
    notifications: '/notifications',
    overview: '/overview',
    userTaskSummary: '/task-summary',
    helpCenter: '/help-center',

    /**
     * AUTH ROUTES
     */
    auth: '/auth',
    login: '/login',

    /**
     * SETTINGS ROUTES
     */
    settings: {
        overview: '/settings',
        appearance: '/settings/appearance',
        profile: '/settings/my-profile',
        loginAndSecurity: '/settings/login-and-security',
        notifications: '/settings/notifications',
        languageAndRegion: '/settings/language-and-region',
    },

    fileDocs: '/admin/mgmt/file-docs',
    inviteMember: '/admin/mgmt/invite-member',
    revenueReports: '/admin/mgmt/revenue',
    roleAndPermissionManage: '/admin/mgmt/access-control',
    userRolePermissionManage: (username: string) =>
        `/admin/mgmt/access-control/users/${username}`,

    /**
     * ADMIN ROUTES
     */
    admin: {
        overview: '/admin',
        settings: '/admin/settings',
        schedule: '/admin/schedule',
        more: '/administrator/more',
    },

    /**
     * MANAGEMENT
     */
    management: {
        jobs: '/mgmt/jobs',
        jobCreation: '/mgmt/jobs/create',
        jobDetail: (jobNo: string) => `/mgmt/jobs/${jobNo}`,
        jobFolderTemplates: '/mgmt/jobs/folder-templates',
        jobFolderTemplateDetail: (id: string) =>
            `/mgmt/jobs/folder-templates/${id}`,
        jobTypes: '/mgmt/job-types',
        jobTypesDetail: (id: string) => `/mgmt/job-types/${id}`,
        clients: '/mgmt/clients',
        clientDetail: (code: string) => `/mgmt/clients/${code}`,
        departments: '/mgmt/departments',
        departmentsDetail: (departmentCode: string) =>
            `/mgmt/departments/${departmentCode}`,
        jobTitles: '/mgmt/job-titles',
        jobTitlesDetail: (jobTitleCode: string) =>
            `/mgmt/job-titles/${jobTitleCode}`,
        paymentChannels: '/financial/payment-channels',
        accessControl: '/mgmt/access-control',
        accessControlUser: '/mgmt/access-control/user',
        roles: '/mgmt/access-control/roles',
        roleDetail: (code: string) => `/mgmt/access-control/roles/${code}`,
        rolePermMatrix: (code: string) =>
            `/mgmt/access-control/roles/${code}/perm-matrix`,
        permissions: '/mgmt/access-control/permissions',
        team: '/mgmt/staff-directory',
        staffDetail: (username: string) => `/mgmt/staff-directory/${username}`,
        files: '/mgmt/access-control/files',
    },

    /**
     * FINANCIAL ROUTES
     */
    financial: {
        overview: '/financial',
        paymentChannels: '/financial/payment-channels',
        payouts: '/financial/payouts',
        payoutsDetail: (jobNo: string) => `/financial/payouts/${jobNo}`,
        receivables: '/financial/receivables',
        ledger: '/financial/ledger',
        transactionDetail: (id: string) => `/financial/ledger/${id}`,
        settings: '/financial/settings',
        invoiceTemplates: '/financial/invoice-templates',
    },

    /**
     * COMMUNITIES
     */
    communities: '/communities',
    getCommunityUrl: (communityCode: string) => `/communities/${communityCode}`,
    getCommunityTopicUrl: (communityCode: string, topicCode: string) =>
        `/communities/${communityCode}/${topicCode}`,
    getPostDetailUrl: (
        communityCode: string,
        topicCode: string,
        postSlug: string
    ) => `/communities/${communityCode}/${topicCode}/${postSlug}`,
} as const
