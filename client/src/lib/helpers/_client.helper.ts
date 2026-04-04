import { EClientType } from '@/shared/enums'
import { Factory, Person } from '@gravity-ui/icons'
import { SVGProps } from 'react'


interface IClientTypeDisplayResult {
	title: string
	icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
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
export class ClientHelper {
	static getClientTypeDisplay(type?: EClientType) {
		switch (type) {
			case 'INDIVIDUAL':
				return {
					title: "Individual",
					icon: Person,
					hexColor: 'success',
					colorName: 'warning'
				} as IClientTypeDisplayResult
			case 'COMPANY':
				return {
					title: "Company",
					icon: Factory,
					hexColor: 'success',
					colorName: 'success'
				} as IClientTypeDisplayResult
			default:
				return {
					title: "Individual",
					icon: Person,
					hexColor: 'success',
					colorName: 'warning'
				} as IClientTypeDisplayResult
		}
	}
}
