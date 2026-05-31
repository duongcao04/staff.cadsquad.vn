export type TExcelColumn<T> = {
    header: string
    key: keyof T
    width?: number
}
export type TExcelData<T> = T[]
