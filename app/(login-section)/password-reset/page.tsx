import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import PasswordResetForm from "./paswordResetForm";

export default async function PasswordResetPage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser()

    if (data.user) {
        redirect('/main-panel')
    } else {
        return <PasswordResetForm />
    }
}