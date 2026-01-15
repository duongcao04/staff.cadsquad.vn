export const AccountProviderEnum = {
    GOOGLE: 'GOOGLE',
    GITHUB: 'GITHUB',
    MICROSOFT: 'MICROSOFT',
    FACEBOOK: 'FACEBOOK',
    LOCAL: 'LOCAL',
} as const
export type AccountProviderEnum =
    (typeof AccountProviderEnum)[keyof typeof AccountProviderEnum]
