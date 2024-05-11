import { Channel } from "src/shared/types"
import { getChannelIcon } from "../../shared/utils"

export default function Category({ category, children }: { category: Channel, children?: JSX.Element[] }) {
    const icon = getChannelIcon(category.type)

    return <div id="category">
        <img id="icon" className="category" height="18px" width="18px" src={icon} />
        <p id="categoryname">{category.name.toUpperCase()}</p>
        {children}
    </div>
}