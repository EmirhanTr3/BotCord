import { Member } from "src/shared/types";
import { useHoverText } from "../hooks";
import { useRef } from "react";
import { t } from "i18next";

export default function BotBadge({ member }: { member: Member }) {
    if (!member.bot && !member.webhook) return <></>
    
    let name = member.webhook ? t("badges.webhook") : t("badges.bot")
    let style: React.CSSProperties = {}
    let verified = false
    
    if (member.badges.includes("VerifiedBot")) {
        verified = true
    }
    
    if (member.username == "clyde") {
        name = t("badges.ai")
        verified = true
        style.backgroundColor = "#2dc770"
    }
    
    const hoverRef = useRef<SVGSVGElement>(null)
    const [HoverText, isOpen] = useHoverText(hoverRef, t("badges.verified", {name}))
    
    return <>
        {verified && isOpen && HoverText}
        <div id="botbadge" style={style}>
            {verified && <svg ref={hoverRef} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffffff" viewBox="0 0 24 24"><path d="M18.7 7.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4l3.3 3.29 7.3-7.3a1 1 0 0 1 1.4 0Z"></path></svg>}
            <p className={verified ? "verified" : ""}>{name}</p>
        </div>
    </>
}