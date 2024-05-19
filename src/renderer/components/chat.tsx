import { Channel, Message } from "src/shared/types"
import { Message as MessageC } from "."
import { getChannelIcon } from "../../shared/utils"
import { useState, useEffect, useRef, createRef } from "react"

export function Chat({ children }: { children?: JSX.Element }) {
    return <div id="chat">{children}</div>
}

export function ChatData({ channel }: { channel: Channel }) {
    const icon = getChannelIcon(channel.type)
    const [messages, setMessages] = useState<Message[]>([])
    const messageRef = createRef<HTMLInputElement>()

    useEffect(() => {
        async function getMessages() {
            const messages: Message[] = await window.api.invoke("getLastMessages", channel.id, 20)
            setMessages(messages)
        }

        getMessages()
    }, [channel])


    //emir i dont know how to implement your shit so i jsut give you example

    //in ur backend u do this
    /**
     * @example bot events handler
     * client.on("messageCreate", (message) => socket.emit("messageCreate", message))
     * 
     */

    //and then here you do this

    const socket: {
        on: (
            event: string,
            handler: (...args: any) => any
        ) => any
    } | any = () => { return  };
    const [MessageList, setMessageList] = useState<string[]>([])

    socket.on("messageCreate", (message: string) => setMessageList([...MessageList, message]))

    //and then you render MessageList like you did
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
            <input
                type="text"
                id="chatinput"
                placeholder="Send a message to channel"
                ref={messageRef}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        console.log(messageRef.current?.value)
                        window.api.invoke('SendMessage', messageRef.current?.value)
                    }
                }}
            />
    </>
    )
}