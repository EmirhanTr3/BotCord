import { createRoot } from 'react-dom/client';
import "./styles/index.css"
import "./styles/app.css"
import "./styles/settings.css"
import { RouterProvider, createHashHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen'
import { StrictMode } from 'react';
import { Member } from 'src/shared/types';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ICU from 'i18next-icu';

declare global {
    interface Window {
        api: Electron.IpcRenderer
    }
}
window.api = window.require("electron").ipcRenderer

const resources = await window.api.invoke("getLangResources")
i18n
    .use(ICU)
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
    })

const hashHistory = createHashHistory()
const router = createRouter({ routeTree, history: hashHistory })

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

window.api.on("login", (_, user: Member) => {
    console.log("got login event")
    window.localStorage.setItem("clientUser", JSON.stringify(user))
    router.navigate({ to: "/" })
})

window.api.on("logout", () => {
    console.log("got logout event")
    window.localStorage.removeItem("clientUser")
    router.navigate({ to: "/login" })
})

window.api.on("error", (_, title, description) => {
    console.error(title, description)
})

document.addEventListener("click", (e) => {
    const target = e.target as HTMLAnchorElement
    if (
        target.tagName == "A" && target.href &&
        !target.href.startsWith("file:///") && !target.href.startsWith("http://localhost:5173")
    ) {
        e.preventDefault()
        window.api.send("openURL", (target.href))
    }
})