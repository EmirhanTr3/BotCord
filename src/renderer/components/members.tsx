import { BotBadge, Member } from ".";

export default function Members() {
    return <div id="members">
        <Member username="Username" pfp="../../assets/icon.png" status="online" />
        <Member username="Username" pfp="../../assets/icon.png" status="idle" botbadge={<BotBadge name="APP"/>} />
    </div>
}