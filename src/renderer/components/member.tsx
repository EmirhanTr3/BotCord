import { Member } from "src/shared/types";
import { BotBadge, PFP, UserStatus } from ".";

export default function MemberC({ member }: { member: Member }) {
    return <div id="member" className={"hover" + (member.status == "offline" ? " offline" : "")}>
        <PFP src={member.avatar} height={32} width={32} />
        <UserStatus height={10} width={10} status={member.status}/>
        <p id="username" style={{color: member.displayColor}}>{member.displayName}</p>
        {(member.bot || member.webhook) && <BotBadge member={member} />}
    </div>
}