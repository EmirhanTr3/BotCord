import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Sidebar, Sidebar2 } from '../../components'
import { DMChannel } from 'src/shared/types'

export const Route = createFileRoute('/dm')({
    loader: async () => {
        const channels = await window.api.invoke("getDMList") as DMChannel[] | undefined
        return channels
    },
    component: DMRoute
})

function DMRoute() {
    const channels = Route.useLoaderData()
    return <>
        <Sidebar />
        <Sidebar2 dms={channels}/>
        <Outlet />
    </>
}