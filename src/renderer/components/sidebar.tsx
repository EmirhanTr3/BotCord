import { useEffect, useRef, useState } from "react"
import { Guild } from "src/shared/types"
import PFP from "./pfp"
import { getAsset } from "../../shared/utils"
import { Link } from "@tanstack/react-router"
import { useHoverText } from "../hooks"

function GuildC({ guild }: { guild: Guild }) {
    const ref = useRef<HTMLImageElement>(null)
    const [HoverText, isOpen] = useHoverText(ref, guild.name)

    return <>
        {isOpen && HoverText}
        <Link to={`/guild/${guild.id}`} style={{height: "calc(48px + 0.4rem)"}}>
            <PFP ref={ref} height={48} width={48} src={guild.icon!}/>
        </Link>
    </>
}

export default function Sidebar() {
    const [guilds, setGuilds] = useState<Guild[]>([])

    useEffect(() => {
        async function getGuilds() {
            const guilds: Guild[] = await window.api.invoke("getGuilds")
            setGuilds(guilds)
        }

        getGuilds()
    }, [])

    return <div id="sidebar">
        <img id="logo" height="48px" width="48px" src={getAsset("icon.png")} />
        <div id="guildSeparator"></div>
        <div id="guildList">
            {guilds.map(guild => <GuildC key={guild.id} guild={guild} />)}
        </div>
    </div>
}