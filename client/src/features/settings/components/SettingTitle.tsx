import { useRouter } from '@tanstack/react-router'
import { ChevronLeftIcon } from 'lucide-react'
import { INTERNAL_URLS } from '../../../lib'
import { useDevice } from '../../../shared/hooks'
import { HeroButton } from '../../../shared/components/ui/hero-button'

type Props = { title: string; description?: string; onBack?: () => void }

export default function SettingTitle({ title, description, onBack }: Props) {
    const { isSmallView } = useDevice()
    const router = useRouter()
    return (
        <div
            style={{
                display: isSmallView ? 'flex' : 'block',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '20px',
            }}
        >
            {isSmallView && (
                <HeroButton
                    isIconOnly
                    variant="flat"
                    size="lg"
                    onPress={() => {
                        if (onBack) {
                            onBack()
                        } else {
                            router.navigate({
                                href: INTERNAL_URLS.settings.overview,
                            })
                        }
                    }}
                >
                    <ChevronLeftIcon size={24} />
                </HeroButton>
            )}
            <div>
                <h1 className="text-xl font-bold text-text-default mb-1">
                    {title}
                </h1>
                <p className="text-sm text-text-subdued">{description}</p>
            </div>
        </div>
    )
}
