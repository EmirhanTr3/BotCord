export default function BotBadge({name, style}: {name: string, style?: React.CSSProperties}) {
    return <div id="botbadge" style={style}><p>{name}</p></div>
}