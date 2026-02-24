import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminPanel from '@/app/components/main-panel/AdminPanel';
import UserPanel from '@/app/components/main-panel/UserPanel';


export default async function Dashboard() {

    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    const userRole = profile?.role

    return (
        <>
            {userRole === 'admin' ? <AdminPanel /> : <UserPanel />}
        </>
    );
}