export default function Members() {
    return <div id="members">
        <div id="member" className="hover"><img id="pfp" height="32px" width="32px" src="../../assets/icon.png" /><img id="userstatus" height="10px" width="10px" src="../../assets/status/online.png" /><p id="username">Username</p></div>
        <div id="member" className="hover"><img id="pfp" height="32px" width="32px" src="../../assets/icon.png" /><img id="userstatus" height="10px" width="10px" src="../../assets/status/idle.png" /><p id="username">Username</p><div id="botbadge"><p>BOT</p></div></div>
    </div>
}