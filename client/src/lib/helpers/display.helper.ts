import { COLORS } from '../utils'

export class DisplayHelper {
    static getTagStyle(hexColor: string = COLORS.black) {
        return {
            backgroundColor: `${hexColor}20`,
            color: hexColor,
        } as React.CSSProperties
    }
}
