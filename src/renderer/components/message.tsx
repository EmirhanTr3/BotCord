import { Message } from "src/shared/types"
import { BotBadge, PFP } from "."

export default function MessageC({ message }: { message: Message }) {
    return <div id="message" className="hover">
        <div id="messagecontent">
            <PFP src={message.author.avatar} height={42} width={42}/>
            <div id="content">
                <div>
                    <p id="username" style={{color: message.author.displayColor}}>{message.author.displayName}</p>
                    {(message.author.bot || message.author.webhook) && <BotBadge member={message.author} />}
                    <p id="time">{message.createdAt}</p>
                </div>
                <p id="msg">
                    <p id="msgcontent">{message.content}</p>
                </p>
            </div>
        </div>
    </div>
}