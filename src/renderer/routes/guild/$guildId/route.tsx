import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { Chat, Members, Sidebar2 } from '../../../components'
import { Guild } from 'src/shared/types'

export const Route = createFileRoute('/guild/$guildId')({
    loader: async ({ params }) => {
        const guild = await window.api.invoke("getGuild", params.guildId) as Guild | undefined
        if (!guild) 
            throw redirect({
                to: "/"
            })
        return guild
    },
    component: GuildC
})

function GuildC() {
    const guild = Route.useLoaderData()
    return (
    <>
        <Sidebar2 guild={guild}/>
        <Chat>
            <Outlet />
        </Chat>
        <Members guild={guild}/>
    </>
    )
}