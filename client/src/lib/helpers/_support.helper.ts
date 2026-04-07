import {
    Zap,
    Briefcase,
    Settings,
    CreditCard,
    User,
    MessageCircle,
} from 'lucide-react'

export class SupportHelper {
    static get categoryMap() {
        return {
            BUG: {
                key: 'BUG',
                title: 'Report a Bug',
                icon: Zap,
            },
            JOB: {
                key: 'JOB',
                title: 'Job Inquiry',
                icon: Briefcase,
            },
            SYSTEM: {
                key: 'SYSTEM',
                title: 'System Issue',
                icon: Settings,
            },
            BILLING: {
                key: 'BILLING',
                title: 'Billing Question',
                icon: CreditCard,
            },
            ACCOUNT: {
                key: 'ACCOUNT',
                title: 'Account Access',
                icon: User,
            },
            OTHER: {
                key: 'OTHER',
                title: 'Other',
                icon: MessageCircle,
            },
        }
    }

    /**
     * Returns the categories as an array for easy mapping in Select components
     */
    static getCategories() {
        return Object.values(this.categoryMap)
    }
}
