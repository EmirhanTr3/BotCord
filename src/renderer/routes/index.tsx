import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '../components'

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return <Sidebar />
}