import { Avatar } from '@heroui/react'
import type { TPaymentChannel } from '@/shared/types'
import { HeroAutocomplete, HeroAutocompleteItem } from '../ui/hero-autocomplete'

interface PaymentChannelSelectProps {
    channels: TPaymentChannel[]
    selectedKey?: string | null
    onSelectionChange: (key: string | null) => void
    label?: string
    placeholder?: string
    errorMessage?: string
    isInvalid?: boolean
    isLoading?: boolean
}

export const PaymentChannelSelect = ({
    channels,
    selectedKey,
    onSelectionChange,
    label = 'Payment Channel',
    placeholder = 'Select a payment method',
    errorMessage,
    isInvalid,
    isLoading,
}: PaymentChannelSelectProps) => {
    // Helper to safely handle the selection event from HeroUI
    const handleSelectionChange = (key: React.Key | null) => {
        onSelectionChange(key as string | null)
    }

    return (
        <HeroAutocomplete
            label={label}
            placeholder={placeholder}
            defaultItems={channels}
            selectedKey={selectedKey}
            onSelectionChange={handleSelectionChange}
            isInvalid={isInvalid}
            errorMessage={errorMessage}
            isLoading={isLoading}
            labelPlacement="outside"
        >
            {(item) => {
                const paymentChannelItem = item as TPaymentChannel

                return (
                    <HeroAutocompleteItem
                        key={paymentChannelItem.id}
                        textValue={paymentChannelItem.displayName} // Critical for search filtering
                    >
                        <div className="flex gap-3 items-center">
                            {/* Logo / Avatar Section */}
                            <Avatar
                                alt={paymentChannelItem.displayName}
                                className="shrink-0"
                                size="sm"
                                src={paymentChannelItem.logoUrl || undefined}
                                name={paymentChannelItem.displayName.charAt(0)}
                                style={{
                                    backgroundColor:
                                        paymentChannelItem.hexColor ||
                                        undefined,
                                    color: paymentChannelItem.hexColor
                                        ? '#fff'
                                        : undefined, // Ensure contrast if color exists
                                }}
                            />

                            {/* Text Details Section */}
                            <div className="flex flex-col">
                                <span className="text-small text-foreground font-medium">
                                    {paymentChannelItem.displayName}
                                </span>
                                <div className="flex gap-2 text-tiny text-default-400">
                                    {paymentChannelItem.ownerName && (
                                        <span>
                                            {paymentChannelItem.ownerName}
                                        </span>
                                    )}
                                    {paymentChannelItem.ownerName &&
                                        paymentChannelItem.cardNumber && (
                                            <span>•</span>
                                        )}
                                    {paymentChannelItem.cardNumber && (
                                        <span>
                                            {paymentChannelItem.cardNumber}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </HeroAutocompleteItem>
                )
            }}
        </HeroAutocomplete>
    )
}
