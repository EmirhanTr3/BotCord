import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '../../components'

export const Route = createFileRoute('/guild')({
    component: Guild
})

function Guild() {
    return (
        <>
            <Sidebar />
            <Outlet />
        </>
    )
}