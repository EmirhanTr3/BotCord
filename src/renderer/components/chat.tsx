import { BotBadge, Message } from "."

export default function Chat() {
    return <div id="chat">
        <div id="channelInfo">
            <img id="icon" height="20px" width="20px" src="../../../assets/channel/text.png" /><p>channel-name</p>
        </div>
        <div id="messages">
            <Message
                username="Username"
                pfp="../../../assets/icon.png"
                time="Today at 00:00"
                msg="This is a test message."
            />
            <Message
                username="Username"
                botbadge={<BotBadge name="APP"/>}
                pfp="../../../assets/icon.png"
                time="Today at 00:00"
                msg="This is a test message."
            />
        </div>
        <form>
            <input type="text" id="chatinput" placeholder="Send a message to channel" />
        </form>
    </div>
}