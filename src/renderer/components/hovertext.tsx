import { useRef } from "react"
import { useHoverText } from "../hooks"

export default function HoverText({ text, children }: { text: string, children: JSX.Element }) {
    const ref = useRef<HTMLDivElement>(null)
    const [HoverText, isOpen] = useHoverText(ref, text)
    
    return <>
        {isOpen && HoverText}
        <div ref={ref}>
            {children}
        </div>
    </>
}