'use client'
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';
import type { Profile } from '@/app/types/profile';

export default function Dashboard() {

    const [profile, setProfile] = useState<Profile | null>(null);

    //Gets the loged user info
    useEffect(() => {
        async function getUserInfo() {
            const supabase = supabaseBrowser
            const { data: authData } = await supabase.auth.getUser();

            const userId = authData.user?.id
            const { data: user } = await supabase
                .from('profiles')
                .select('name, lastname, role, email, phone, id')
                .eq('id', userId)
                .single()

            setProfile(user)
        }
        getUserInfo()
    }, [])

    console.log(profile)
    return (
        <div>
            <h1>Welcome {profile?.name}</h1>
            <section className='flex flex-col'>
                <form action="/auth/logout" method='post'>
                    <button type='submit' className='p-2 rounded-lg bg-black text-white hover:cursor-pointer'>Logout</button>
                </form>
            </section>
        </div>
    )

}