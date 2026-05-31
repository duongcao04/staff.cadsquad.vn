import { useState, useEffect } from 'react'

interface UseHideOnScrollOptions {
    threshold?: number // Khoảng cách cuộn tối thiểu để kích hoạt ẩn/hiện (tránh giật lag)
    topOffset?: number // Khoảng cách từ đầu trang mà tại đó thanh điều hướng luôn hiện
}

export function useHideOnScroll(options: UseHideOnScrollOptions = {}) {
    const { threshold = 10, topOffset = 50 } = options
    const [isHidden, setIsHidden] = useState(false)

    useEffect(() => {
        let lastScrollY = window.scrollY

        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Bỏ qua nếu người dùng cuộn một khoảng nhỏ hơn threshold
            if (Math.abs(currentScrollY - lastScrollY) < threshold) {
                return
            }

            // Nếu cuộn xuống (current > last) VÀ đã vượt qua topOffset -> Ẩn
            if (currentScrollY > lastScrollY && currentScrollY > topOffset) {
                setIsHidden(true)
            }
            // Nếu cuộn lên -> Hiện
            else {
                setIsHidden(false)
            }

            lastScrollY = currentScrollY
        }

        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [threshold, topOffset])

    return isHidden
}
