export type ActionVariant = 'solid' | 'bordered' | 'flat' | 'light'
export type ActionColor =
	| 'default'
	| 'primary'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'danger'

export type NotificationActionKey =
	| 'DISMISS_ACTIONS'
	| 'ACCEPT_REVIEW'
	| 'REJECT_REVIEW'

export class NotificationActionDto {
	id!: string
	label!: string
	variant!: ActionVariant
	color?: ActionColor
	actionKey?: NotificationActionKey
	actionRedirect?: string
}
