import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import UserPanel from "../components/main-panel/UserPanel";
import AdminPanel from "../components/main-panel/AdminPanel";

export default async function ProtectLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    //If there is no logged user redirect to login page
    if (!data.user) {
        redirect('/login')
    }

    return (
        <div>
            {children}
        </div >
    )
}