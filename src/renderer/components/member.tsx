import { Member } from "src/shared/types";
import { BotBadge, PFP, UserStatus } from ".";
import { useUserModal } from "../hooks";

export default function MemberC({ member }: { member: Member }) {
    const [UserModal, isUserModalOpen, toggleUserModal] = useUserModal(member)

    return <>
        {isUserModalOpen && UserModal}
        <div id="member" className={"hover" + (member.status == "offline" ? " offline" : "")} onClick={toggleUserModal}>
            <PFP src={member.avatar} height={32} width={32} />
            <UserStatus height={10} width={10} status={member.status}/>
            <p id="username" style={{color: member.displayColor}}>{member.displayName}</p>
            <BotBadge member={member} />
        </div>
    </>
}