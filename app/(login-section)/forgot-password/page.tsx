'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState<string | null>(null)

    async function handleReset(e: React.FormEvent) {
        e.preventDefault()

        const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: 'http://localhost:3000/reset-password',
            }
        )

        if (error) {
            setMessage(error.message)
            return
        }

        setMessage('Please check your inbox to confirm your email.')
    }

    return (
        < div className="flex flex-col mx-auto mt-20 items-center md:w-190 w-[90%] bg-neutral-200 shadow-md p-8 rounded-2xl" >
            <h1 className="font-bold text-4xl">Adopta</h1>
            <p className="text-xl mt-1">Password recover</p>
            <form onSubmit={handleReset} className="mt-10 md:w-[50%] w-full">
                <div className="flex flex-col gap-6">
                    <input type="email" placeholder="Email" defaultValue={"adoptaadmin@hotmail.com"} required onChange={e => setEmail(e.target.value)} className="w-full rounded-md p-1 border-2 border-neutral-500" />

                    <button type="submit" className="text-white bg-black p-2 rounded-md hover:cursor-pointer">Recover</button>
                </div>
            </form>
            {message && <p className="text-red-500 my-3">{message}</p>}
            <div className="flex flex-col md:flex-row items-center gap-2 mt-8">
            </div>
        </div >
    )
}