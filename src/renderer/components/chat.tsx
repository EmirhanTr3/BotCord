import { Channel, Guild, Member, Message } from "src/shared/types"
import { Message as MessageC, PFP, UserStatus } from "."
import { getChannelIcon } from "../../shared/utils"
import { useState, useEffect, SyntheticEvent, useRef } from "react"

export function Chat({ children }: { children?: JSX.Element }) {
    return <div id="chat">{children}</div>
}

export function ChatData({ channel }: { channel: Channel }) {
    const icon = getChannelIcon(channel.type)
    const [messages, setMessages] = useState<Message[]>([])
    const [isAutoCompleteOpen, setAutoCompleteOpen] = useState<boolean>(false)
    const [autoCompleteMemberList, setAutoCompleteMemberList] = useState<Member[]>([])
    const [autoCompleteChannelList, setAutoCompleteChannelList] = useState<Channel[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [channels, setChannels] = useState<Channel[]>([])
    const [autoCompleteType, setAutoCompleteType] = useState<"member" | "channel">()
    const messagesRef = useRef<HTMLDivElement>(null)
    const messageRef = useRef<HTMLInputElement>(null)
    const [reply, setReply] = useState<Message>()

    useEffect(() => {
        window.api.removeAllListeners("messageCreate")

        async function fetchData() {
            const messages: Message[] = await window.api.invoke("getLastMessages", channel.id, 30)
            setMessages(messages)
            setTimeout(() => {
                messagesRef.current!.scrollTop = messagesRef.current!.scrollHeight - messagesRef.current!.clientHeight
            }, 10)

            const guild: Guild = await window.api.invoke("getGuild", channel.guildId)
            setMembers(guild.members)
            setChannels(guild.channels)
        }

        fetchData()
    }, [channel])


    window.api.on("messageCreate", (e, message: Message) => {
        if (message.channelId !== channel.id) return;
        window.api.removeAllListeners("messageCreate")
        console.log(`received messageCreate from ${message.author.username}: ${message.content}`)
        setMessages([...messages, message])
        setTimeout(() => {
            messagesRef.current!.scrollTop = messagesRef.current!.scrollHeight - messagesRef.current!.clientHeight
        }, 10);
    })

    let lastTypingSentAt: Date | undefined;

    function sendMessage(e: SyntheticEvent) {
        e.preventDefault()
        if (messageRef.current!.value.replaceAll(" ", "").length == 0) return;
        window.api.send("sendMessage", channel, messageRef.current!.value, reply)
        if (reply) setReply(undefined)
        messageRef.current!.value = ""
        lastTypingSentAt = undefined
    }

    function inputChange(e: SyntheticEvent) {
        const message = messageRef.current!.value

        if (/@(?:[^ ]+)?$/g.test(message)) checkMemberAutoComplete(message)
        else if (/#(?:[^ ]+)?$/g.test(message)) checkChannelAutoComplete(message)
        else if (isAutoCompleteOpen) setAutoCompleteOpen(false)

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

    function checkMemberAutoComplete(message: string) {
        const filter = message.replace(/.*@(.*)/g, "$1")

        const memberList = members.filter(m => m.displayName.toLowerCase().includes(filter.toLowerCase()) || m.username.toLowerCase().includes(filter.toLowerCase()))
        if (memberList.length < 1) {
            if (isAutoCompleteOpen) setAutoCompleteOpen(false)
            return;
        }

        setAutoCompleteMemberList(memberList)
        setAutoCompleteOpen(true)
        setAutoCompleteType("member")
    }

    function autoCompleteMemberClick(member: Member) {
        setAutoCompleteOpen(false)
        const message = messageRef.current!.value
        const filter = message.replace(/.*@(.*)/g, "$1")

        const split = message.split("@" + filter)
        const last = split[split.length - 1]
        split.pop()
        messageRef.current!.value = split.join("@" + filter) + `<@${member.id}>` + last + " "
        messageRef.current!.focus()
    }

    function checkChannelAutoComplete(message: string) {
        const filter = message.replace(/.*#(.*)/g, "$1")

        const channelList = channels.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()))
        if (channelList.length < 1) {
            if (isAutoCompleteOpen) setAutoCompleteOpen(false)
            return;
        }

        setAutoCompleteChannelList(channelList)
        setAutoCompleteOpen(true)
        setAutoCompleteType("channel")
    }

    function autoCompleteChannelClick(channel: Channel) {
        setAutoCompleteOpen(false)
        const message = messageRef.current!.value
        const filter = message.replace(/.*#(.*)/g, "$1")

        const split = message.split("#" + filter)
        const last = split[split.length - 1]
        split.pop()
        messageRef.current!.value = split.join("#" + filter) + `<#${channel.id}>` + last + " "
        messageRef.current!.focus()
    }

    return (
    <>
        <div id="channelInfo">
            <img id="icon" height="20px" width="20px" src={icon} /><p>{channel.name}</p>
        </div>
        <div id="messages" ref={messagesRef}>
            {messages.map((message, index) => {
                let classList: string[] = [];

                if (
                    !(message.interaction || message.reference) &&
                    index != 0 &&
                    messages[index - 1].author.username == message.author.username
                ) {
                    classList.push("anothermessage")
                }

                if (
                    index != (messages.length - 1) &&
                    !(messages[index + 1].interaction || messages[index + 1].reference) &&
                    messages[index + 1].author.username == message.author.username
                ) {
                    classList.push("hasothermessages")
                }

                return <MessageC key={message.id} message={message} setReply={setReply} extraClass={classList}/>
            })}
        </div>
        <form onSubmit={sendMessage} onInput={inputChange}>
            <input type="text" id="chatinput" placeholder="Send a message to channel" ref={messageRef}/>
        </form>

        {isAutoCompleteOpen &&
            <div id="autocomplete">
                <div id="content">
                    {autoCompleteType == "member" ?
                    <>
                        <p id="title">MEMBERS</p>
                        <div id="list">
                            {autoCompleteMemberList.map(member => 
                                <div key={member.id} id="member" className="hover" onClick={() => autoCompleteMemberClick(member)}>
                                    <PFP height={24} width={24} src={member.avatar} />
                                    <UserStatus height={8} width={9} status={member.status} />
                                    <p id="displayname">{member.displayName}</p>
                                    <p id="username">{member.username}</p>
                                </div>
                            )}
                        </div>
                    </> :
                    <>
                        <p id="title">TEXT CHANNELS</p>
                        <div id="list" className="channels">
                            {autoCompleteChannelList.map(channel => 
                                <div key={channel.id} id="member" className="hover" onClick={() => autoCompleteChannelClick(channel)}>
                                    <PFP height={20} width={20} src={getChannelIcon(channel.type)} />
                                    <p id="displayname">{channel.name}</p>
                                    {channel.parent && <p id="username">{channel.parent.name}</p>}
                                </div>
                            )}
                        </div>
                    </>
                    }
                </div>
            </div>
        }
        {reply &&
            <div id="reply">
                <div id="textdiv">
                    <p id="text">Replying to</p>
                    <p id="username" style={{color: reply.author.displayColor}}>{reply.author.displayName}</p>
                </div>
                <div id="close" onClick={() => setReply(undefined)}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#c3c3c3" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg></div>
            </div>
        }
    </>
    )
}