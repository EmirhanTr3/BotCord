import { createFileRoute, redirect } from '@tanstack/react-router'
import { ChatData } from '../../../../components'
import { Channel } from 'src/shared/types'

export const Route = createFileRoute('/guild/$guildId/channel/$channelId')({
  loader: async ({ params }) => {
    const channel = await window.api.invoke("getChannel", params.channelId) as Channel | undefined
    if (!channel) 
        throw redirect({
            to: "/"
        })
    return channel
},
  component: ChannelC
})

function ChannelC() {
  const channel = Route.useLoaderData()
  return <ChatData channel={channel}/>
}