'use client'
import { useEffect, useState } from 'react';
import type { Profile } from '@/app/types/profile';
import type { Pet } from '@/app/types/pet';

type ApiGetUser = {
    data: {
        profile: Profile
        pets: Pet[]
    } | null
    error: string | null
    loading: boolean
}

export default function Dashboard() {

    //Gets the loged user info
    const [userData, setUserData] = useState<ApiGetUser>({
        data: null,
        error: null,
        loading: true,
    });
    useEffect(() => {
        async function getUser() {
            try {
                const res = await fetch('/api/db', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    throw new Error('Error getting user data')
                }
                const data = await res.json()
                setUserData(data)
            } catch (err) {
                setUserData({
                    data: null,
                    error: err instanceof Error ? err.message : 'Unexpected error',
                    loading: false
                })
            }

        }
        getUser()
    }, [])

    if (userData.loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (userData.error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-red-700">{userData.error}</p>
            </div>
        );
    }

    return (
        <div className="container w-[80%] mx-auto mt-10">
            <h1 className="text-2xl font-semibold">
                Welcome {userData.data?.profile.name}
            </h1>

            <form action="/auth/logout" method="post">
                <button className="p-2 rounded-lg bg-black text-white">
                    Logout
                </button>
            </form>
        </div>
    );
}