export default function PFP({src, height, width}: {src: string, height: number, width: number}) {
    return <img id="pfp" height={height} width={width} src={src} />
}