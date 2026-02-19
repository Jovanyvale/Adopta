import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (!user || authError) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { petId } = await req.json()

        if (!petId || Number.isNaN(Number(petId))) {
            return NextResponse.json(
                { error: "Invalid pet id" },
                { status: 400 }
            )
        }

        const { error: deleteError } = await supabase
            .from("pets")
            .delete()
            .eq("id", petId)
            .eq("owner_id", user.id)

        if (deleteError) {
            return NextResponse.json(
                { error: deleteError.message },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.log(err)
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        )
    }
}
