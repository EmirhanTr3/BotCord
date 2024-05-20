import { Channel, Message } from "src/shared/types"
import { Message as MessageC } from "."
import { getChannelIcon } from "../../shared/utils"
<<<<<<< HEAD
import { useState, useEffect, useRef, createRef } from "react"
=======
import { useState, useEffect, SyntheticEvent, useRef } from "react"
>>>>>>> 0a4629bbff4a988ccd9ec1015d484b837108e895

export function Chat({ children }: { children?: JSX.Element }) {
    return <div id="chat">{children}</div>
}

export function ChatData({ channel }: { channel: Channel }) {
    const icon = getChannelIcon(channel.type)
    const [messages, setMessages] = useState<Message[]>([])
<<<<<<< HEAD
    const messageRef = createRef<HTMLInputElement>()
=======
    const messagesRef = useRef<HTMLDivElement>(null)
    const messageRef = useRef<HTMLInputElement>(null)
>>>>>>> 0a4629bbff4a988ccd9ec1015d484b837108e895

    useEffect(() => {
        window.api.removeAllListeners("messageCreate")

        async function getMessages() {
            const messages: Message[] = await window.api.invoke("getLastMessages", channel.id, 30)
            setMessages(messages)
            setTimeout(() => {
                messagesRef.current!.scrollTop = messagesRef.current!.scrollHeight - messagesRef.current!.clientHeight
            }, 1)
        }

        getMessages()
    }, [channel])


<<<<<<< HEAD
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
=======
    window.api.on("messageCreate", (e, message: Message) => {
        if (message.channelId !== channel.id) return;
        window.api.removeAllListeners("messageCreate")
        console.log(`received messageCreate from ${message.author.username}: ${message.content}`)
        setMessages([...messages, message])
        setTimeout(() => {
            messagesRef.current!.scrollTop = messagesRef.current!.scrollHeight - messagesRef.current!.clientHeight
        }, 1);
    })

    function sendMessage(e: SyntheticEvent) {
        e.preventDefault()
        if (messageRef.current!.value.replaceAll(" ", "").length == 0) return;
        window.api.send("sendMessage", channel, messageRef.current!.value)
        messageRef.current!.value = ""
    }

>>>>>>> 0a4629bbff4a988ccd9ec1015d484b837108e895
    return (
    <>
        <div id="channelInfo">
            <img id="icon" height="20px" width="20px" src={icon} /><p>{channel.name}</p>
        </div>
        <div id="messages" ref={messagesRef}>
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
<<<<<<< HEAD
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
=======
        <form onSubmit={sendMessage}>
            <input type="text" id="chatinput" placeholder="Send a message to channel" ref={messageRef}/>
        </form>
>>>>>>> 0a4629bbff4a988ccd9ec1015d484b837108e895
    </>
    )
}