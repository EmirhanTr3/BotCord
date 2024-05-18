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
    }, [channel])

    return (
    <>
        <div id="channelInfo">
            <img id="icon" height="20px" width="20px" src={icon} /><p>{channel.name}</p>
        </div>
        <div id="messages">
            {messages.map((message, index) => {
                let classList: string[] = [];

                if (index != 0 && messages[index - 1].author.username == message.author.username) {
                    classList.push("anothermessage")
                }

                if (index != (messages.length - 1) && messages[index + 1].author.username == message.author.username) {
                    classList.push("hasothermessages")
                }

                return <MessageC key={message.id} message={message} extraClass={classList}/>
            })}
        </div>
        <form>
            <input type="text" id="chatinput" placeholder="Send a message to channel" />
        </form>
    </>
    )
}