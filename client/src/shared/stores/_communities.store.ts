import { Store } from '@tanstack/store'

export const communitiesStore = new Store({
	isWritingPost: false
})

export const setWritingPost = (status: boolean) => {
	communitiesStore.setState((state) => ({
		...state,
		isWritingPost: status,
	}))
}