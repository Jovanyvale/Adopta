'use client'
import { useEffect, useState } from 'react';
import type { Profile } from '@/app/types/profile';
import type { Pet } from '@/app/types/pet';
import SpotlightCard from '@/app/components/SpotlightCard';

type ApiGetUser = {
    data: {
        profile: Profile
        pets: Pet[]
    } | null
    error: string | null
    loading: boolean
}

export default function Dashboard() {

    const [userData, setUserData] = useState<ApiGetUser>({
        data: null,
        error: null,
        loading: true,
    });
    const [schedules, setSchedules] = useState()

    //Gets the loged user info
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
                setUserData({
                    data: data,
                    error: null,
                    loading: false
                })

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

    //Gets the schedules related to the users pet
    useEffect(() => {
        async function getSchedules() {
            try {
                const res = await fetch('/api/db/getSchedules', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    throw new Error('Error getting schedules')
                }
                const data = await res.json()
                setSchedules(data)
                setTimeout(() => {
                    console.log(schedules)
                    console.log(data)
                }, 2000);

            } catch (err) {
                console.log('Error')
            }

        }
        getSchedules();
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


        <div className="grid grid-cols-7 grid-rows-5 gap-4 h-170 w-[90%] mx-auto mt-16" >
            <SpotlightCard className="col-span-3 row-span-2">1</SpotlightCard>
            <SpotlightCard className="col-span-4 row-span-2 col-start-4">2</SpotlightCard>
            <SpotlightCard className="col-span-2 row-span-2 row-start-3">3</SpotlightCard>
            <SpotlightCard className="col-span-2 col-start-1 row-start-5">4</SpotlightCard>
            <SpotlightCard className="col-span-3 row-span-3 col-start-3 row-start-3">5</SpotlightCard>
            <SpotlightCard className="col-span-2 row-span-3 col-start-6 row-start-3">6</SpotlightCard>
        </div>

    );
}