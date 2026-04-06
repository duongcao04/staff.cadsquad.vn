import { EPaymentChannelType } from '@/shared/enums'


interface IPaymentChannelIconResult {
	icon: string
	hexColor: string
	colorName:
	| 'success'
	| 'primary'
	| 'warning'
	| 'danger'
	| 'default'
	| 'secondary'
	| undefined
}
export class PaymentChannelHelper {
	static getIcon(type?: EPaymentChannelType) {
		switch (type) {
			case 'BANK':
				return {
					icon: "streamline-color:bank-flat",
					hexColor: 'primary',
					colorName: 'success'
				} as IPaymentChannelIconResult
			case 'E_WALLET':
				return {
					icon: "streamline-plump-color:wallet",
					hexColor: "primary",
					colorName: "primary"
				} as IPaymentChannelIconResult
			case 'CRYPTO':
				return {
					icon: "streamline-ultimate-color:crypto-currency-ripple",
					hexColor: "warning",
					colorName: "warning"
				} as IPaymentChannelIconResult
			default:
				return {
					icon: "streamline-color:bank-flat",
					hexColor: 'primary',
					colorName: 'success'
				} as IPaymentChannelIconResult
		}
	}
}
