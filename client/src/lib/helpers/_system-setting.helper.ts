import { SHAREPOINT } from "../utils";
import { TSystemSetting } from "../validationSchemas";

export interface SettingsFormValues {
    // Workflow
    defaultAssigneeIds: string[];
    autoCancelJobsAfterDaysLate: number;
    autoUpgradePriorityDaysBeforeDue: number;

    // System
    auditLogRetentionDays: number;
    enableDetailedLogging: boolean;
    maintenanceMode: boolean;

    // Notifications
    notifyWhenDueAt: number;

    // Financial
    defaultCurrency: string;
    taxRatePercentage: number;
    paymentDueDays: number;

    // Integrations
    sharepointRootFolderId: string;
    autoCreateSharepointFolders: boolean;

    // Security
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
}

export class SystemSettingHelper {
    // 1. Centralized Keys (Useful if you need to reference a specific key elsewhere in the app)
    static KEYS = {
        DEFAULT_ASSIGNEE_IDS: 'defaultAssigneeIds',
        AUTO_CLOSE_JOBS_AFTER_DAYS: 'autoCloseJobsAfterDays',
        DEFAULT_JOB_PRIORITY: 'defaultJobPriority',
        AUTO_CANCEL_JOBS_AFTER_DAYS_LATE: 'autoCancelJobsAfterDaysLate',
        AUTO_UPGRADE_PRIORITY_DAYS_BEFORE_DUE: 'autoUpgradePriorityDaysBeforeDue',
        AUDIT_LOG_RETENTION_DAYS: 'auditLogRetentionDays',
        ENABLE_DETAILED_LOGGING: 'enableDetailedLogging',
        MAINTENANCE_MODE: 'maintenanceMode',
        NOTIFY_WHEN_DUE_AT: 'notifyWhenDueAt',
        DEFAULT_CURRENCY: 'defaultCurrency',
        TAX_RATE_PERCENTAGE: 'taxRatePercentage',
        PAYMENT_DUE_DAYS: 'paymentDueDays',
        SHAREPOINT_ROOT_FOLDER_ID: 'sharepointRootFolderId',
        AUTO_CREATE_SHAREPOINT_FOLDERS: 'autoCreateSharepointFolders',
        SESSION_TIMEOUT_MINUTES: 'sessionTimeoutMinutes',
        MAX_LOGIN_ATTEMPTS: 'maxLoginAttempts',
        REQUIRE_EMAIL_VERIFICATION: 'requireEmailVerification',
    } as const;

    // 2. Centralized Defaults
    static DEFAULT_SETTINGS: SettingsFormValues = {
        defaultAssigneeIds: [],
        autoCancelJobsAfterDaysLate: 0,
        autoUpgradePriorityDaysBeforeDue: 2,

        auditLogRetentionDays: 90,
        enableDetailedLogging: false,
        maintenanceMode: false,

        notifyWhenDueAt: 2,

        defaultCurrency: 'USD',
        taxRatePercentage: 0,
        paymentDueDays: 30,

        sharepointRootFolderId: SHAREPOINT.JOB_FOLDER_TEMPLATE_ID,
        autoCreateSharepointFolders: true,

        sessionTimeoutMinutes: 1440,
        maxLoginAttempts: 5,
        requireEmailVerification: true,
    };

    // 3. Get and parse a single setting by its key
    static getSettingByKey<K extends keyof SettingsFormValues>(
        dbSettings: Pick<TSystemSetting, 'key' | 'value'>[],
        key: K
    ): SettingsFormValues[K] {
        const row = dbSettings.find((s) => s.key === key);
        const fallback = this.DEFAULT_SETTINGS[key];

        if (!row) return fallback;

        try {
            // Automatically determine the parser based on the fallback's JS type
            if (typeof fallback === 'boolean') {
                return (row.value === 'true') as SettingsFormValues[K];
            }
            if (typeof fallback === 'number') {
                return Number(row.value) as SettingsFormValues[K];
            }
            if (Array.isArray(fallback)) {
                return JSON.parse(row.value || '[]') as SettingsFormValues[K];
            }
            // Default fallback is string
            return row.value as SettingsFormValues[K];
        } catch (e) {
            return fallback;
        }
    }

    // 4. Method: Map ALL DB Rows -> Form Values (Dynamically generated!)
    static parseSettings(dbSettings: Pick<TSystemSetting, 'key' | 'value'>[]): SettingsFormValues {
        const result = {} as SettingsFormValues;

        // Dynamically loop through every key defined in DEFAULT_SETTINGS
        const keys = Object.keys(this.DEFAULT_SETTINGS) as Array<keyof SettingsFormValues>;

        for (const key of keys) {
            result[key] = this.getSettingByKey(dbSettings, key) as never;
        }

        return result;
    }

    // 5. Method: Map Form Values -> DB Rows (For your submit handler)
    static formatForSave(values: SettingsFormValues): Pick<TSystemSetting, 'key' | 'value'>[] {
        // Dynamically stringify arrays and cast others to strings
        return Object.entries(values).map(([key, val]) => ({
            key,
            value: Array.isArray(val) ? JSON.stringify(val) : String(val),
        }));
    }
}