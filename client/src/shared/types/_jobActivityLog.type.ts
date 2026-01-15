import type { IJobActivityLogResponse } from '../interfaces'

export type TJobActivityLog = Omit<
    Required<IJobActivityLogResponse>,
    'jobId' | 'modifiedById'
>
