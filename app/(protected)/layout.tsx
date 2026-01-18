'use client'
import { redirect } from "next/navigation"
import { useEffect, useState } from "react";
import type { Profile } from "../types/profile";
import type { Pet } from "../types/pet";

export type ApiGetUser = {
    profile: Profile
    pets: Pet
}

export default function ProtectLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

    const [user, setUser] = useState<ApiGetUser>({})
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        async function getUser() {
            const res = await fetch('/api/db', {
                method: 'GET',
                credentials: 'include',
            })
            const data = await res.json()
            setUser(data)
        }
        getUser()
    }, [])

    if (!user) {
        redirect('/')
    }

    return (
        <>
            <p>{`Welcome ${user}`}</p>
            {children}
        </>
    )
}