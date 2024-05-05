export default function Chat() {
    return <div id="chat">
    <div id="channelInfo">
        <img id="icon" height="20px" width="20px" src="../../assets/channel/text.png" /><p>channel-name</p>
    </div>
    <div id="messages">
        <div id="message" className="hover">
        <img id="pfp" height="42px" width="42px" src="../../assets/icon.png" />
        <div id="content">
            <div>
            <p id="username">Username</p>
            <p id="time">Today at 00:00</p>
            </div>
            <p id="msg">This is a test message.</p>
        </div>
        </div>
        <div id="message" className="hover">
        <img id="pfp" height="42px" width="42px" src="../../assets/icon.png" />
        <div id="content">
            <div>
            <p id="username">Username</p>
            <div id="botbadge"><p>BOT</p></div>
            <p id="time">Today at 00:00</p>
            </div>
            <p id="msg">This is a test message.</p>
        </div>
        </div>
    </div>
    <form>
        <input type="text" id="chatinput" placeholder="Send a message to channel" />
    </form>
    </div>
}