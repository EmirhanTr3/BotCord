import { SyntheticEvent, useEffect, useRef, useState } from "react"
import { Guild } from "src/shared/types"
import PFP from "./pfp"

function GuildC({ guild }: { guild: Guild }) {

    function onClick(e: SyntheticEvent) {
        e.preventDefault()
        console.log(`clicked on guild ${guild.name} (${guild.id})`)
    }

    return <PFP height={48} width={48} src={guild.icon} onClick={onClick}/>
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
        <img id="logo" height="48px" width="48px" src="../../assets/icon.png" />
        <div id="guildSeparator"></div>
        <div id="guildList">
            {guilds.map(guild => <GuildC guild={guild} />)}
        </div>
    </div>
}