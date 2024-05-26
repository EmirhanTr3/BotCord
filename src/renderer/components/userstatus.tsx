import { UserStatus } from "src/shared/types";
import { getAsset } from "../../shared/utils";
import { useRef } from "react";
import { useHoverText } from "../hooks";

export default function UserStatusC({ height, width, status }: { height: number, width: number, status: UserStatus }) {
    const icon = getAsset(`status/${status}.png`)
    const ref = useRef<HTMLImageElement>(null)
    const [HoverText, isOpen] = useHoverText(ref, getStatusText(status))

    return <>
        {isOpen && HoverText}
        <img id="userstatus" ref={ref} height={height} width={width} src={icon} />
    </>
}

function getStatusText(status: UserStatus): string {
    switch (status) {
        case "online": return "Online"
        case "idle": return "Idle"
        case "dnd": return "Do Not Disturb"
        default: return "Offline"
    }
}