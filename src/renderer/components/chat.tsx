import { Channel, Message } from "src/shared/types"
import { Message as MessageC } from "."
import { getChannelIcon } from "../../shared/utils"
import { useState, useEffect, SyntheticEvent, useRef } from "react"

export function Chat({ children }: { children?: JSX.Element }) {
    return <div id="chat">{children}</div>
}

export function ChatData({ channel }: { channel: Channel }) {
    const icon = getChannelIcon(channel.type)
    const [messages, setMessages] = useState<Message[]>([])
    const messagesRef = useRef<HTMLDivElement>(null)
    const messageRef = useRef<HTMLInputElement>(null)

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


    window.api.on("messageCreate", (e, message: Message) => {
        if (message.channelId !== channel.id) return;
        window.api.removeAllListeners("messageCreate")
        console.log(`received messageCreate from ${message.author.username}: ${message.content}`)
        setMessages([...messages, message])
        setTimeout(() => {
            messagesRef.current!.scrollTop = messagesRef.current!.scrollHeight - messagesRef.current!.clientHeight
        }, 1);
    })

    let lastTypingSentAt: Date | undefined;
    function sendMessage(e: SyntheticEvent) {
        e.preventDefault()
        if (messageRef.current!.value.replaceAll(" ", "").length == 0) return;
        window.api.send("sendMessage", channel, messageRef.current!.value)
        messageRef.current!.value = ""
        lastTypingSentAt = undefined
    }

    function inputChange(e: SyntheticEvent) {
        const message = messageRef.current!.value

        if (
            (
                !lastTypingSentAt ||
                new Date().getTime() - lastTypingSentAt.getTime() > 10_000
            ) &&
            message.replaceAll(" ", "") !== ""
        ) {
            lastTypingSentAt = new Date()
            window.api.send("sendTyping", channel)
            // if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove()
        }
    }

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
        <form onSubmit={sendMessage} onInput={inputChange}>
            <input type="text" id="chatinput" placeholder="Send a message to channel" ref={messageRef}/>
        </form>
    </>
    )
}