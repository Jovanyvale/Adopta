import { createClient } from '@/lib/supabase/server'
import AiAssistance from '@/app/components/AiAssistance';

export default async function Dashboard() {

    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser();

    //Gets the loged user info
    const userId = authData.user?.id
    const { data: profile } = await supabase
        .from('profiles')
        .select('name, lastname, role')
        .eq('id', userId)
        .single()

    return (
        <div>
            <h1>Welcome {profile?.name}</h1>

            <AiAssistance />

            <form action="/auth/logout" method='post'>
                <button type='submit' className='p-2 rounded-lg bg-black text-white hover:cursor-pointer'>Logout</button>
            </form>
        </div>
    )

}