import { createFileRoute } from '@tanstack/react-router'
import { SyntheticEvent, useRef } from 'react'

export const Route = createFileRoute('/login')({
    component: Login
})

function LoginForm() {
    const ref = useRef<HTMLInputElement>(null)

    function submit(e: SyntheticEvent) {
        e.preventDefault()
        const token = ref.current!.value
        window.api.send("login", token)
    }

    return <form onSubmit={submit}>
        <label>Bot Token</label>
        <input ref={ref} type="password" required />
        <button>Login</button>
    </form>
}

function Login() {
    return (
    <>
        <div id="loginpage">
            <div id="login">
                <LoginForm />
            </div>
        </div>
    </>
    )
}