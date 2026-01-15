import '../../../styles/loading.css'

import { Image } from 'antd'
import { useTheme } from 'next-themes'

import { MotionDiv } from '@/lib/motion'
import { GlassBackground } from '@/shared/components'

import CSDLogo from '../../../assets/logo.webp'
import WhiteCSDLogo from '../../../assets/logo-white.webp'

export default function AppLoading() {
    const { theme, systemTheme } = useTheme()

    let logo = CSDLogo
    if (theme === 'light') {
        logo = CSDLogo
    } else {
        if (systemTheme === 'light') {
            logo = CSDLogo
        } else {
            logo = WhiteCSDLogo
        }
    }
    return (
        <div className="fixed top-0 right-0 z-999999999999">
            <GlassBackground>
                <MotionDiv
                    className="w-screen h-screen max-w-screen max-h-screen overflow-hidden grid place-items-center"
                    initial={{ x: 0, opacity: 1 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100vw', opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="loader"></div>
                    <div className="absolute rounded-full">
                        <Image
                            src={logo}
                            alt="CSD Logo"
                            className="rounded-full max-w-50"
                            preview={false}
                        />
                    </div>
                </MotionDiv>
            </GlassBackground>
        </div>
    )
}
