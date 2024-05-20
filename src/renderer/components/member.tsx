import { Member } from "src/shared/types";
import { BotBadge, PFP, UserStatus } from ".";
import { useState } from "react";

export default function MemberC({ member }: { member: Member }) {
    const [Open, setOpen] = useState(false)

    return <>
        <div id={`profile-modal`} className={Open? ``: "hidden"}>
            working modal
        </div>
        <div id="member" className={"hover" + (member.status == "offline" ? " offline" : "")} role="button" onClick={() => setOpen(!Open)}>
            <PFP src={member.avatar} height={32} width={32} />
            <UserStatus height={10} width={10} status={member.status}/>
            <p id="username" style={{color: member.displayColor}}>{member.displayName}</p>
            {(member.bot || member.webhook) && <BotBadge member={member} />}
        </div>
    </>
}