import { z, ZodType } from 'zod'

export const SharepointItemSchema: ZodType<any> = z.lazy(
    () =>
        z.object({
            id: z.string().catch('N/A'),
            itemId: z.string().nullish(),
            displayName: z.string().nullish(),
            isFolder: z.coerce.boolean().nullish(),
            size: z.coerce.number().nullish(),
            webUrl: z.string().nullish(),
            publicWebUrl: z.string().nullish(),
            isAnonymous: z.coerce.boolean().catch(false),
            createdDateTime: z.string().nullish(),
            createdBy: z.string().nullish(),
        }) as any
)

export type TSharepointItem = z.infer<typeof SharepointItemSchema>
