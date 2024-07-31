import { Member } from "src/shared/types";
import { BotBadge, PFP, UserStatus } from ".";
import { useHoverText, useUserModal } from "../hooks";
import { useRef } from "react";
import { t } from "i18next";

export default function MemberC({ member }: { member: Member }) {
    const [UserModal, isUserModalOpen, toggleUserModal] = useUserModal(member)
    const crownRef = useRef<SVGSVGElement>(null)
    const [CrownHoverText, isCrownHoverTextOpen] = useHoverText(crownRef, t("badges.serverowner"))

    return <>
        {isUserModalOpen && UserModal}
        {isCrownHoverTextOpen && CrownHoverText}
        <div id="member" className={"hover" + (member.status == "offline" ? " offline" : "")} onClick={toggleUserModal}>
            <PFP src={member.avatar} height={32} width={32} />
            <UserStatus height={10} width={10} status={member.status}/>
            <p id="username" style={{color: member.displayColor}}>{member.displayName}</p>
            {member.isOwner && <svg ref={crownRef} id="ownercrown" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#f0b132" viewBox="0 0 24 24"><path d="M5 18a1 1 0 0 0-1 1 3 3 0 0 0 3 3h10a3 3 0 0 0 3-3 1 1 0 0 0-1-1zM3.04 7.76a1 1 0 0 0-1.52 1.15l2.25 6.42a1 1 0 0 0 .94.67h14.55a1 1 0 0 0 .95-.71l1.94-6.45a1 1 0 0 0-1.55-1.1l-4.11 3-3.55-5.33.82-.82a.83.83 0 0 0 0-1.18l-1.17-1.17a.83.83 0 0 0-1.18 0l-1.17 1.17a.83.83 0 0 0 0 1.18l.82.82-3.61 5.42z"></path></svg>}
            <BotBadge member={member} />
        </div>
    </>
}