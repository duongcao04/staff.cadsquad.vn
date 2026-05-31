import type { SVGProps } from 'react'

export function FluentColorErrorCircle20(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 20 20"
            {...props}
        >
            <g fill="none">
                <path
                    fill="url(#SVGydnWceli)"
                    d="M10 2a8 8 0 1 1 0 16a8 8 0 0 1 0-16"
                ></path>
                <path
                    fill="url(#SVGQIabMcGH)"
                    fillRule="evenodd"
                    d="M10.5 6.5a.5.5 0 0 0-1 0V11a.5.5 0 0 0 1 0zM10 14a.75.75 0 1 0 0-1.5a.75.75 0 0 0 0 1.5"
                    clipRule="evenodd"
                ></path>
                <defs>
                    <linearGradient
                        id="SVGydnWceli"
                        x1={4.5}
                        x2={15}
                        y1={-0.5}
                        y2={19.5}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#ffcd0f"></stop>
                        <stop offset={1} stopColor="#fe8401"></stop>
                    </linearGradient>
                    <linearGradient
                        id="SVGQIabMcGH"
                        x1={8}
                        x2={12}
                        y1={6}
                        y2={14}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#4a4a4a"></stop>
                        <stop offset={1} stopColor="#212121"></stop>
                    </linearGradient>
                </defs>
            </g>
        </svg>
    )
}
