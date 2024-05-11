import { Guild } from "src/shared/types";
import { Member, Role } from ".";

export default function Members({ guild }: { guild: Guild }) {
    return <div id="members">
        {guild.roles.filter(role => role.memberCount !== 0).map(role => {
            return <Role key={role.id} role={role}>
                {guild.members.filter(member => member.hoistRole?.id == role.id).sort((a, b) => a.displayName.localeCompare(b.displayName)).map(member => {
                    return <Member key={member.id} member={member}/>
                })}
            </Role>
        })}
        <Role key="everyone" role={guild.everyone!}>
            {guild.members.filter(member => member.highestRole?.id == guild.everyone?.id).sort((a, b) => a.displayName.localeCompare(b.displayName)).map(member => {
                return <Member key={member.id} member={member} />
            })}
        </Role>
    </div>
}