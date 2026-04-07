import { FAQ_GROUPS, FAQS, TFAQ } from '@/lib/constants/faqs'
import HtmlReactParser from '@/shared/components/ui/html-react-parser'
import { usePermission } from '@/shared/hooks'
import {
    Accordion,
    AccordionItem,
    Card,
    CardBody,
    CardHeader,
    Divider,
} from '@heroui/react'
import { useMemo } from 'react'

export function FAQ() {
    const { hasPermission } = usePermission()

    // Filter and group FAQs based on the current user's permissions
    const visibleGroups = useMemo(() => {
        return FAQ_GROUPS.map((group) => {
            const permittedFaqs = group.faqIds
                .map((id) => FAQS.find((faq) => faq.id === id))
                .filter((faq): faq is TFAQ => {
                    if (!faq) return false
                    // If the FAQ requires a permission, evaluate it via custom hook
                    if (faq.hasPermission) {
                        return hasPermission(faq.hasPermission)
                    }
                    // If no permission is required, everyone can see it
                    return true
                })

            return {
                ...group,
                faqs: permittedFaqs,
            }
        }).filter((group) => group.faqs.length > 0) // Hide empty sections
    }, [hasPermission])

    return (
        <div>
            {visibleGroups.length === 0 ? (
                <div className="py-10 text-center border text-text-subdued bg-default-50 rounded-xl border-default-200">
                    No FAQs available for your current permission level.
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {visibleGroups.map((group) => (
                        <Card
                            shadow="none"
                            key={group.id}
                            className="flex flex-col gap-4 border border-border-default"
                        >
                            {/* Section Header */}
                            <CardHeader className="flex-col items-start px-4">
                                <h2 className="text-xl font-semibold text-text-default">
                                    {group.title}
                                </h2>
                                <p className="text-sm text-text-subdued">
                                    {group.description}
                                </p>
                            </CardHeader>

                            <Divider className="bg-border-default" />

                            {/* Section Accordion */}
                            <CardBody className='py-0!'>
                                <Accordion>
                                    {group.faqs.map((faq) => (
                                        <AccordionItem
                                            key={faq.id}
                                            aria-label={faq.question}
                                            title={faq.question}
                                        >
                                            <HtmlReactParser
                                                htmlString={faq.answer}
                                                className="text-text-subdued text-sm"
                                            />
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
