import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import LoginForm from "./loginForm";

export default async function LoginPage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser()

    if (data.user) {
        redirect('/dashboard')
    } else {
        return <LoginForm />
    }
}
