import { createLazyFileRoute } from '@tanstack/react-router'
import { Chat, Loading, Members, Sidebar, Sidebar2 } from '../components'

export const Route = createLazyFileRoute('/')({
    component: Index,
})

function Index() {
    return (
    <>
        <Loading />
        <Sidebar />
        <Sidebar2 />
        <Chat />
        <Members />
    </>
    )
}