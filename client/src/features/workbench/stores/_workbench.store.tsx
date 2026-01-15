import { Store } from '@tanstack/react-store'

export const workbenchStore = new Store({
    page: 1,
    sort: '',
    searchKeywords: '',
    limit: 10,
})
