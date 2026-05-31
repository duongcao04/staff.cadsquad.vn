import { Avatar, Chip } from "@heroui/react"

export const PreviewTable = ({ fontSize, themeColor }: any) => {
    const textSize =
        fontSize === 'sm'
            ? 'text-xs'
            : fontSize === 'lg'
              ? 'text-base'
              : 'text-sm'

    return (
        <div
            className={`border border-border-default rounded-xl overflow-hidden bg-white shadow-sm`}
        >
            <div className="bg-background-hovered px-4 py-2 border-b border-border-default flex justify-between items-center">
                <span className="text-xs font-bold text-text-subdued uppercase">
                    Preview: Data Table
                </span>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-default bg-background-muted">
                        <th
                            className={`text-left px-4 py-2 font-medium text-text-subdued ${textSize}`}
                        >
                            Name
                        </th>
                        <th
                            className={`text-left px-4 py-2 font-medium text-text-subdued ${textSize}`}
                        >
                            Role
                        </th>
                        <th
                            className={`text-left px-4 py-2 font-medium text-text-subdued ${textSize}`}
                        >
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2].map((i) => (
                        <tr
                            key={i}
                            className="border-b bg-background border-border-default last:border-0"
                        >
                            <td className={`px-4 py-4`}>
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        size="sm"
                                        src={`https://i.pravatar.cc/150?u=${i}`}
                                    />
                                    <div>
                                        <p
                                            className={`font-bold text-text-default ${textSize}`}
                                        >
                                            User {i}
                                        </p>
                                        <p className="text-[10px] text-text-subdued">
                                            user{i}@example.com
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td
                                className={`px-4 py-4 text-slate-600 ${textSize}`}
                            >
                                Developer
                            </td>
                            <td className={`px-4 py-4`}>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="capitalize"
                                    style={{
                                        color: themeColor,
                                        backgroundColor: `${themeColor}20`,
                                    }}
                                >
                                    Active
                                </Chip>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
