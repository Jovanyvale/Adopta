'use client'
import { useEffect, useState } from 'react';
import type { Profile } from '@/app/types/profile';
import type { Pet } from '@/app/types/pet';

type ApiGetUser = {
    profile: Profile
    pets: Pet[]
}

export default function Dashboard() {

    //Gets the loged user info
    const [user, setUser] = useState<ApiGetUser | null>(null)

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

    return (
        <div className='container w-[80%] mx-auto mt-10'>
            {!user ?
                <p>Getting data</p>
                :
                <div>
                    <h1 className='text-2xl font-semibold '>Welcome {user.profile.name}</h1>
                    <section className='flex flex-col w-2'>
                        <form action="/auth/logout" method='post'>
                            <button type='submit' className='p-2 rounded-lg bg-black text-white hover:cursor-pointer'>Logout</button>
                        </form>
                    </section>
                </div>
            }
        </div>
    )

}