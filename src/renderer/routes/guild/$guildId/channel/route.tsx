import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/guild/$guildId/channel')({
    component: Guild
})

function Guild() {
    return <Outlet />
}