import { createRoot } from 'react-dom/client';
import "./index.css"
import "./app.css"
import { RouterProvider, createRouter, } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen'
import { StrictMode } from 'react';
import { Member } from 'src/shared/types';

declare global {
    interface Window {
        api: Electron.IpcRenderer
    }
}
window.api = window.require("electron").ipcRenderer

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
  )
}

window.api.on("navigate", (_, route) => {
    router.navigate({
        to: route
    })
})

window.api.on("login", (e, user: Member) => {
    console.log("got login event")
    window.localStorage.setItem("clientUser", JSON.stringify(user))
})

window.api.on("error", (_, title, description) => {
    console.log(title, description)
})