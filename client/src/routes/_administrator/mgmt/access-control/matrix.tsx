import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_administrator/mgmt/access-control/matrix',
)({
  component: PermissionViewFullMatrixPage,
})

import { 
    Button, 
    Input, 
    Select, 
    SelectItem, 
    Chip,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tooltip
} from '@heroui/react';
import { 
    Search, 
    Download, 
    Save, 
    Filter,
    CheckCircle2, 
    XCircle, 
    UserCheck, 
    ShieldAlert,
    ArrowLeft
} from 'lucide-react';
import { PageHeading, HeroCard } from '@/shared/components';
import { useNavigate } from '@tanstack/react-router';

// Access Level Icons (Mapping for the full table)
const ACCESS_ICONS: Record<string, React.ReactNode> = {
    full: <CheckCircle2 size={18} className="text-success mx-auto" />,
    own: <UserCheck size={18} className="text-primary mx-auto" />,
    none: <XCircle size={18} className="text-default-300 mx-auto" />,
    limit: <ShieldAlert size={18} className="text-warning mx-auto" />,
};

const fullMatrixData = [
    { id: 1, entity: 'Community', action: 'Update Info', member: 'none', author: 'none', moderator: 'none', admin: 'full' },
    { id: 2, entity: 'Community', action: 'Moderate Members', member: 'none', author: 'none', moderator: 'limit', admin: 'full' },
    { id: 3, entity: 'Topic', action: 'Create/Delete', member: 'none', author: 'none', moderator: 'none', admin: 'full' },
    { id: 4, entity: 'Post', action: 'Create', member: 'full', author: 'full', moderator: 'full', admin: 'full' },
    { id: 5, entity: 'Post', action: 'Update', member: 'none', author: 'own', moderator: 'limit', admin: 'full' },
    { id: 6, entity: 'Post', action: 'Delete', member: 'none', author: 'own', moderator: 'full', admin: 'full' },
    { id: 7, entity: 'Post', action: 'Lock/Pin', member: 'none', author: 'none', moderator: 'full', admin: 'full' },
    { id: 8, entity: 'Comment', action: 'Create', member: 'full', author: 'full', moderator: 'full', admin: 'full' },
    { id: 9, entity: 'Comment', action: 'Delete', member: 'none', author: 'own', moderator: 'full', admin: 'full' },
];

export default function PermissionViewFullMatrixPage() {
    const navigate = useNavigate();

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button 
                        isIconOnly 
                        variant="flat" 
                        size="sm" 
                        onPress={() => navigate({ href: '/admin/access-control' })}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Full Authority Matrix</h1>
                        <p className="text-sm text-slate-500 font-medium">Detailed mapping of atomic permissions to system roles.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="bordered" startContent={<Download size={16}/>} className="font-bold">Export PDF</Button>
                    <Button color="primary" startContent={<Save size={16}/>} className="font-bold shadow-lg shadow-primary/30">Save Changes</Button>
                </div>
            </div>

            {/* --- Toolbar --- */}
            <HeroCard className="border-divider shadow-sm bg-white">
                <div className="p-4 flex flex-col md:flex-row gap-4">
                    <Input 
                        placeholder="Search action or entity..." 
                        startContent={<Search size={18} className="text-default-400"/>}
                        className="max-w-xs"
                        variant="bordered"
                    />
                    <Select placeholder="Filter by Entity" className="max-w-[200px]" variant="bordered">
                        <SelectItem key="post">Post</SelectItem>
                        <SelectItem key="community">Community</SelectItem>
                        <SelectItem key="comment">Comment</SelectItem>
                    </Select>
                    <Select placeholder="Permission Type" className="max-w-[200px]" variant="bordered">
                        <SelectItem key="write">Write/Edit</SelectItem>
                        <SelectItem key="mod">Moderation</SelectItem>
                    </Select>
                    <Button isIconOnly variant="light" className="ml-auto"><Filter size={20}/></Button>
                </div>
            </HeroCard>

            {/* --- Full Matrix Table --- */}
            <div className="border border-divider rounded-[2rem] overflow-hidden bg-white shadow-xl">
                <Table 
                    aria-label="Full Permission Matrix"
                    removeWrapper
                    classNames={{
                        th: "bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-widest py-5 border-b border-divider",
                        td: "py-4 border-b border-divider/50 px-6",
                    }}
                >
                    <TableHeader>
                        <TableColumn width={180}>ENTITY</TableColumn>
                        <TableColumn width={250}>ACTION / PERMISSION</TableColumn>
                        <TableColumn align="center">MEMBER</TableColumn>
                        <TableColumn align="center">AUTHOR</TableColumn>
                        <TableColumn align="center">MODERATOR</TableColumn>
                        <TableColumn align="center">ADMIN</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {fullMatrixData.map((row) => (
                            <TableRow key={row.id} className="hover:bg-primary-50/30 transition-colors group">
                                <TableCell>
                                    <Chip size="sm" variant="flat" color="primary" className="font-bold uppercase text-[9px]">
                                        {row.entity}
                                    </Chip>
                                </TableCell>
                                <TableCell className="font-bold text-sm text-slate-700">
                                    {row.action}
                                </TableCell>
                                <TableCell className="cursor-pointer active:scale-90 transition-transform">
                                    {ACCESS_ICONS[row.member]}
                                </TableCell>
                                <TableCell className="cursor-pointer active:scale-90 transition-transform">
                                    {ACCESS_ICONS[row.author]}
                                </TableCell>
                                <TableCell className="cursor-pointer active:scale-90 transition-transform">
                                    {ACCESS_ICONS[row.moderator]}
                                </TableCell>
                                <TableCell>
                                    {ACCESS_ICONS[row.admin]}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Legend Component (Reusing from Preview) */}
            <div className="flex justify-center gap-8 py-4 opacity-70">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><CheckCircle2 size={14} className="text-success"/> Full Access</div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><UserCheck size={14} className="text-primary"/> Own Items Only</div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><ShieldAlert size={14} className="text-warning"/> Limited/Moderate</div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><XCircle size={14} className="text-default-300"/> No Access</div>
            </div>
        </div>
    );
}