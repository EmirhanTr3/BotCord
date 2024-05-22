import { getAsset } from "../../shared/utils"

export default function AppFrame() {
    function minimize() {
        window.api.send("minimize")
    }

    function maximize() {
        window.api.send("maximize")
    }

    function close() {
        window.api.send("close")
    }

    return <div id="appframe">
        <div id="name">
            <img width={18} height={18} src={getAsset("icon.png")}/>
            <p>BotCord</p>
        </div>
        <div id="buttons">
            <div id="minimize" onClick={minimize}><svg width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fillRule="evenodd" clipRule="evenodd"></path></svg></div>
            <div id="maximize" onClick={maximize}><svg width="13" height="13" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H1.5H13.5H14V1.5V13.5V14H13.5H1.5H1V13.5V1.5V1ZM2 2V13H13V2H2Z" fillRule="evenodd" clipRule="evenodd"></path></svg></div>
            <div id="close" onClick={close}><svg width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fillRule="evenodd" clipRule="evenodd"></path></svg></div>
        </div>
    </div>
}