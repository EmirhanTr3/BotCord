import { createRoot } from 'react-dom/client';
import "./index.css"
import { Loading, Sidebar, Sidebar2, Chat, Members } from "./components"

const root = createRoot(document.getElementById("root")!)

root.render(<>
    {/* <Loading /> */}
    <Sidebar />
    <Sidebar2 />
    <Chat />
    <Members />
</>
)