import { Role } from "src/shared/types";

export default function RoleC({ role, children }: { role: Role, children?: JSX.Element[] }) {
    return <div id="role" className={role.isEveryone ? "role-everyone": ""}>
        <p id="name">{role.name}{!role.isEveryone && ` — ${role.memberCount}`}</p>
        {children}
    </div>
}