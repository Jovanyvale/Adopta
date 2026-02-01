'use client'
import Link from "next/link"
import { supabaseBrowser } from '@/lib/supabase/browser'
import { useState } from "react"
import DemoMessage from "@/app/components/DemoMessage"
import { redirect } from "next/navigation"

export default function LoginForm() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)


    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null)

        const { error } = await supabaseBrowser.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            return
        }

        redirect('/main-panel')
    }

    return (
        <div>
            <DemoMessage />

            < div className="flex flex-col mx-auto mt-20 items-center md:w-190 w-[90%] bg-neutral-200 shadow-md p-8 rounded-2xl" >
                <h1 className="font-bold text-4xl">Adopta</h1>
                <p className="text-xl mt-1">Login form</p>
                <form onSubmit={handleLogin} className="mt-10 md:w-[50%] w-full">
                    <div className="flex flex-col gap-6">

                        <input type="email" placeholder="Email" required onChange={e => setEmail(e.target.value)} className="w-full rounded-md p-1 border-2 border-neutral-500" />

                        <input type="text" placeholder="Password" required onChange={e => setPassword(e.target.value)} className="w-full rounded-md p-1 border-2 border-neutral-500" />

                        <button type="submit" className="text-white bg-black p-2 rounded-md hover:cursor-pointer">Login</button>
                    </div>
                </form>
                {error && <p className="text-red-500 my-3">{error}</p>}
                <div className="flex flex-col md:flex-row items-center gap-2 mt-8">
                    <p>Do not have an account?</p>
                    <Link href={'/register'} className="text-blue-500 font-semibold">Register</Link>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2 mt-8">
                    <p>Do not remember your password?</p>
                    <Link href={'/forgot-password'} className="text-blue-500 font-semibold">Reset password</Link>
                </div>
            </div >
        </div>
    )
}