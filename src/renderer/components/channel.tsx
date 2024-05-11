import { Channel } from "src/shared/types"
import { getChannelIcon } from "../../shared/utils"

export default function ChannelC({ channel }: { channel: Channel }) {
    const icon = getChannelIcon(channel.type)

    return <div id="channel" className="hover">
        <img id="icon" height="20px" width="20px" src={icon} />
        <p id="channelname">{channel.name}</p>
    </div>
}