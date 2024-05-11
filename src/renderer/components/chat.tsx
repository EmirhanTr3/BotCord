import { Channel, Message } from "src/shared/types"
import { Message as MessageC } from "."
import { getChannelIcon } from "../../shared/utils"
import { useState, useEffect } from "react"

export function Chat({ children }: { children?: JSX.Element }) {
    return <div id="chat">{children}</div>
}

export function ChatData({ channel }: { channel: Channel }) {
    const icon = getChannelIcon(channel.type)
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        async function getMessages() {
            const messages: Message[] = await window.api.invoke("getLastMessages", channel.id, 20)
            setMessages(messages)
        }

        getMessages()
    }, [])

    return (
    <>
        <div id="channelInfo">
            <img id="icon" height="20px" width="20px" src={icon} /><p>{channel.name}</p>
        </div>
        <div id="messages">
            {messages.map(message => <MessageC key={message.id} message={message}/>)}
        </div>
        <form>
            <input type="text" id="chatinput" placeholder="Send a message to channel" />
        </form>
    </>
    )
}