import type { IConfigResponse } from '../interfaces'

export type TUserConfig = Omit<IConfigResponse, 'userId'>
