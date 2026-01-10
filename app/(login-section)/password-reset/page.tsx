'use client'

import { useState } from 'react'
import { useRouter } from "next/navigation"
import { supabaseBrowser } from '@/lib/supabase/browser'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()

    //Redirect user if NOT loged in
    useEffect(() => {
        supabaseBrowser.auth.getSession().then(({ data }) => {
            if (!data.session) {
                router.replace('/login')
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()

        const { error } = await supabaseBrowser.auth.updateUser({
            password,
        })

        if (error) {
            setMessage(error.message)
            return
        }

        setMessage('Contraseña actualizada')

        setTimeout(() => {
            redirect('/login')
        }, 1500);
    }

    return (
        < div className="flex flex-col mx-auto mt-20 items-center md:w-190 w-[90%] bg-neutral-200 shadow-md p-8 rounded-2xl" >
            <h1 className="font-bold text-4xl">Adopta</h1>
            <p className="text-xl mt-1">Password reset</p>
            <form onSubmit={handleUpdate} className="mt-10 md:w-[50%] w-full">
                <div className="flex flex-col gap-6">
                    <input type="text" placeholder="New password" required onChange={e => setPassword(e.target.value)} className="w-full rounded-md p-1 border-2 border-neutral-500" />

                    <button type="submit" className="text-white bg-black p-2 rounded-md hover:cursor-pointer">Recover</button>
                </div>
            </form>
            {message && <p className="text-green-500 my-3">{message}</p>}
            <div className="flex flex-col md:flex-row items-center gap-2 mt-8">
            </div>
        </div >
    )
}