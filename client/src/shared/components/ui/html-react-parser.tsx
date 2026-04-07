import { Link } from '@tanstack/react-router'
import { Image } from 'antd'
import parse, {
    type DOMNode,
    domToReact,
    Element,
    type HTMLReactParserOptions,
} from 'html-react-parser'
import { cn } from '../../../lib'

type HtmlReactParserProps = {
    htmlString: string
    className?: string
    attClassNames?: {
        link?: string
        img?: string
    }
}
export default function HtmlReactParser({
    htmlString,
    className,
    attClassNames,
}: HtmlReactParserProps) {
    const options: HTMLReactParserOptions = {
        replace: (domNode: DOMNode) => {
            // We must check if the node is an Element (an HTML tag) before accessing attribs
            if (domNode instanceof Element && domNode.attribs) {
                // 1. Replace <a> with Custom <Link>
                if (domNode.name === 'a') {
                    const { href, class: className } = domNode.attribs

                    // Ensure strictly internal links use Next Link
                    if (href && href.startsWith('/')) {
                        return (
                            <Link
                                to={href}
                                className={cn(
                                    'hover:underline font-semibold',
                                    className,
                                    attClassNames?.link
                                )}
                            >
                                {domToReact(
                                    domNode.children as DOMNode[],
                                    options
                                )}
                            </Link>
                        )
                    }
                }

                // 2. Replace <img> with Ant Design <Image>
                if (domNode.name === 'img') {
                    const {
                        src,
                        alt,
                        width,
                        height,
                        class: className,
                    } = domNode.attribs

                    // Antd Image works best with numeric width/height if provided
                    if (width && height) {
                        return (
                            <Image
                                src={src}
                                alt={alt || 'image'}
                                width={parseInt(width, 10)}
                                height={parseInt(height, 10)}
                                className={cn(className, attClassNames?.img)}
                            />
                        )
                    }
                }
            }
        },
    }

    return (
        <div className={cn('prose', className)}>
            {parse(htmlString, options)}
        </div>
    )
}
