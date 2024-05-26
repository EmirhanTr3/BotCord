import { useState, useEffect, useRef } from "react"
import { Portal } from "react-portal"

export default function useHoverText(element: React.RefObject<HTMLElement>, text: string): [JSX.Element, boolean] {
    const [mouseLocation, setMouseLocation] = useState<{x: number, y: number}>({x: 0, y: 0})
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const hoverText = useRef<HTMLDivElement>(null)

    if (element.current) {
        element.current.onmouseenter = () => {
            const parentBound = element.current!.getBoundingClientRect()
            setMouseLocation({
                x: parentBound.x + (parentBound.width / 2),
                y: parentBound.y - 3
            })
            setIsOpen(true)
        }

        element.current.onmouseleave = () => {
            setIsOpen(false)
        }
    }

    return [
        <Portal>
            <div ref={hoverText} id="hovertext" style={{top: mouseLocation.y, left: mouseLocation.x}}>
                <p>{text}</p>
            </div>
        </Portal>,
        isOpen
    ]
}