import { PFP } from "."

type Message = {
    username: string,
    botbadge?: any,
    pfp: string,
    time: string,
    msg: string
}

export default function Message({username, botbadge, pfp, time, msg}: Message) {
    return <div id="message" className="hover">
        <PFP src={pfp} height={42} width={42}/>
        <div id="content">
            <div>
                <p id="username">{username}</p>
                {botbadge}
                <p id="time">{time}</p>
            </div>
            <p id="msg">{msg}</p>
        </div>
    </div>
}