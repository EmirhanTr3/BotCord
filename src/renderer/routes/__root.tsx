import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
    component: () => (
    <>
        <Outlet />
        <TanStackRouterDevtools position='bottom-right'/>
    </>
    ),
    beforeLoad: async (options) => {
        const isLoggedIn = await window.api.invoke("getIsLoggedIn")
        if (!isLoggedIn) options.navigate({
            to: "/login"
        })
        else if (options.location.href == "/login") options.navigate({
            to: "/"
        })
    }
})
