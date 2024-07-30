import { createFileRoute, redirect } from '@tanstack/react-router'
import { Chat, ChatData } from '../../../components'
import { DMChannel } from 'src/shared/types'

export const Route = createFileRoute('/dm/$dmId')({
    loader: async ({ params }) => {
        const channel = await window.api.invoke("getDMChannel", params.dmId) as DMChannel | undefined
        if (!channel) 
            throw redirect({
                to: "/dm"
            })
        return channel
    },
    component: DM
})

function DM() {
    const channel = Route.useLoaderData()
    return <Chat>
        <ChatData channel={channel} isDM/>
    </Chat>
}