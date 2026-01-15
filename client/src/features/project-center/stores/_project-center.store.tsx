import { Store } from '@tanstack/react-store'
import { ProjectCenterTabEnum } from '@/shared/enums'

export const projectCenterStore = new Store({
    tab: ProjectCenterTabEnum.PRIORITY,
    page: 1,
    limit: 10,
    isHideFinishItems: false,
})
