import PanelAsideBar from "@/app/components/main-panel/PanelAsideBar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ControlPanelLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    const userRole = profile?.role;

    if (userRole === "admin") {
        return <>{children}</>;
    }

    return <PanelAsideBar>{children}</PanelAsideBar>;
}
