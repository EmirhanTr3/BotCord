import { useRef } from "react"
import { useHoverText } from "../hooks"

export default function Badge({ badge }: { badge: {name: string, icon: string} }) {
    const badgeRef = useRef<HTMLImageElement>(null)
    const [HoverText, isOpen] = useHoverText(badgeRef, badge.name)

    return <>
        {isOpen && HoverText}
        <img ref={badgeRef} id="badge" width={22} height={22} src={badge.icon} />
    </>
}