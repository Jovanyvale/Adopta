import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import RegisterForm from "./registerForm";

export default async function RegisterPage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser()

    if (data.user) {
        redirect('/main-panel')
    } else {
        return <RegisterForm />
    }
}

