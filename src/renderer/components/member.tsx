import { PFP } from ".";

export default function Member({username, pfp, status, botbadge}: {username: string, pfp: string, status: string, botbadge?: any}) {
    return <div id="member" className="hover">
        <PFP src={pfp} height={32} width={32} />
        {/* status will be optained from utils function */}
        <img id="userstatus" height="10px" width="10px" src="../../assets/status/online.png" />
        <p id="username">{username}</p>
        {botbadge}
    </div>
}