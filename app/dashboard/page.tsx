import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Dashboard() {

    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
        redirect('/login')
    }

    return (
        <div>
            <h1>Welcome {data.user.email}</h1>

            <form action="/auth/logout" method='post'>
                <button type='submit' className='p-2 rounded-lg bg-black text-white hover:cursor-pointer'>Logout</button>
            </form>
        </div>
    )

}