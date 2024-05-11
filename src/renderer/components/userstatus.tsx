import { UserStatus } from "src/shared/types";
import { getAsset } from "../../shared/utils";

export default function UserStatusC({ height, width, status }: { height: number, width: number, status: UserStatus }) {
    const icon = getAsset(`status/${status}.png`)

    return <img id="userstatus" height={height} width={width} src={icon} />
}