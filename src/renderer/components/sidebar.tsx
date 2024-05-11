import { SyntheticEvent, useEffect, useState } from "react"
import { Guild } from "src/shared/types"
import PFP from "./pfp"
import { getAsset } from "../../shared/utils"

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
        <img id="logo" height="48px" width="48px" src={getAsset("icon.png")} />
        <div id="guildSeparator"></div>
        <div id="guildList">
            {guilds.map(guild => <GuildC key={guild.id} guild={guild} />)}
        </div>
    </div>
}