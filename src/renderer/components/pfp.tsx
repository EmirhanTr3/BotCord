import { SyntheticEvent, forwardRef } from "react";

export default forwardRef<HTMLImageElement, { height: number, width: number, src: string, onClick?: (event: SyntheticEvent<HTMLImageElement, MouseEvent>) => void}>((props, ref) => {
    return <img ref={ref} id="pfp" {...props}/>
})
