import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
    Tooltip,
    Slider,
    cn
} from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import lodash from 'lodash'
import { Briefcase, Hash, Shield, Sparkles, X } from 'lucide-react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { z } from 'zod'
import slugify from 'slugify'

// Define Schema locally if not imported
const CreateJobTitleSchema = z.object({
    displayName: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    level: z.number().min(1).max(10),
    notes: z.string().optional(),
})

type TCreateJobTitleInput = z.infer<typeof CreateJobTitleSchema>

type ModifyJobTitleModalProps = {
    isOpen: boolean
    onClose: () => void
    jobTitleId?: string // If present, we are editing
}

export function ModifyJobTitleModal({
    isOpen,
    onClose,
    jobTitleId,
}: ModifyJobTitleModalProps) {
    const queryClient = useQueryClient()
    const isEditing = !lodash.isEmpty(jobTitleId)

    // Mocking the options/fetch logic based on your pattern
    // const { data: jobTitle } = useQuery({ ...jobTitleOptions(jobTitleId) })
    // const mutation = useMutation(createJobTitleOptions)

    const formik = useFormik<TCreateJobTitleInput>({
        initialValues: {
            displayName: '',
            code: '',
            level: 1,
            notes: '',
        },
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(CreateJobTitleSchema),
        onSubmit: async (values) => {
            console.log('Submitting Job Title:', values)
            // await mutation.mutateAsync(values)
            onClose()
        },
    })

    const handleGenerateCode = () => {
        if (!formik.values.displayName) return
        const generated = slugify(formik.values.displayName, { replacement: '_', lower: false })
            .toUpperCase()
            .replace(/[^A-Z0-9_]/g, '')
        formik.setFieldValue('code', `ROLE_${generated}`)
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            size="xl"
            backdrop="blur"
            classNames={{
                base: "border border-white/10 bg-background/80 backdrop-blur-md shadow-2xl",
                header: "border-b border-white/5 pb-4",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center gap-3 pt-6">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,111,238,0.2)]">
                                <Briefcase size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black tracking-tight">
                                    {isEditing ? 'Update Position' : 'Define New Position'}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-text-subdued tracking-widest">
                                    Organizational Hierarchy System
                                </span>
                            </div>
                        </ModalHeader>

                        <ModalBody className="py-6 space-y-8">
                            <form id="job-title-form" onSubmit={formik.handleSubmit} className="space-y-6">
                                {/* Identity Row */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Input
                                        name="displayName"
                                        label="Position Title"
                                        placeholder="e.g. Senior Software Engineer"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        classNames={{ label: "font-bold text-xs uppercase tracking-wider" }}
                                        value={formik.values.displayName}
                                        onChange={formik.handleChange}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold tracking-wider uppercase text-foreground">
                                            System Code
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                name="code"
                                                placeholder="ROLE_SR_ENG"
                                                variant="flat"
                                                className="flex-1"
                                                startContent={<Hash size={14} className="text-text-subdued" />}
                                                value={formik.values.code}
                                                onChange={formik.handleChange}
                                            />
                                            <Tooltip content="Magic Link Code" showArrow>
                                                <Button
                                                    isIconOnly
                                                    variant="faded"
                                                    className="shadow-sm border-white/10"
                                                    onPress={handleGenerateCode}
                                                    isDisabled={!formik.values.displayName}
                                                >
                                                    <Sparkles size={16} className="text-primary" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>

                                {/* Seniority Slider - Visualizing the 'level' field */}
                                <div className="p-4 space-y-4 border rounded-2xl bg-white/5 border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-primary" />
                                            <span className="text-xs font-bold tracking-widest uppercase">Authority Level</span>
                                        </div>
                                        <Badge color="primary" variant="flat" className="font-mono">
                                            LVL {formik.values.level}
                                        </Badge>
                                    </div>
                                    <Slider 
                                        step={1} 
                                        maxValue={10} 
                                        minValue={1} 
                                        defaultValue={1}
                                        showSteps={true}
                                        size="sm"
                                        value={formik.values.level}
                                        onChange={(val) => formik.setFieldValue('level', val)}
                                        classNames={{
                                            track: "bg-default-500/30",
                                            filler: "bg-primary shadow-[0_0_10px_rgba(0,111,238,0.5)]",
                                            thumb: "bg-primary border-2 border-white shadow-lg"
                                        }}
                                    />
                                    <p className="text-[10px] text-text-subdued italic">
                                        Higher levels grant broader system visibility and structural permissions.
                                    </p>
                                </div>

                                <Textarea
                                    name="notes"
                                    label="Role Description"
                                    placeholder="Outline primary responsibilities and KPIs..."
                                    labelPlacement="outside"
                                    variant="bordered"
                                    minRows={3}
                                    classNames={{ label: "font-bold text-xs uppercase tracking-wider" }}
                                    value={formik.values.notes}
                                    onChange={formik.handleChange}
                                />
                            </form>
                        </ModalBody>

                        <ModalFooter className="border-t bg-white/5 border-white/5">
                            <Button 
                                variant="light" 
                                onPress={onClose} 
                                className="font-bold"
                                startContent={<X size={18} />}
                            >
                                Discard
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                form="job-title-form"
                                className="px-8 font-black shadow-lg shadow-primary/20"
                                // isLoading={mutation.isPending}
                            >
                                {isEditing ? 'Save Changes' : 'Initialize Position'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}