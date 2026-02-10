import { createClient } from "@/lib/supabase/server";;
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error } = await supabase.auth.getUser()

        if (!user || error) {
            return NextResponse.json({ message: "Couldn't get user info" }, { status: 401 })
        }


        //Data to update
        const { name, lastname, phone } = await req.json();

        if (!name || name.length < 2 || name.length > 18) {
            return NextResponse.json({ message: "Invalid name" }, { status: 400 });
        }

        if (!lastname || lastname.length < 2 || lastname.length > 28) {
            return NextResponse.json({ message: "Invalid lastname" }, { status: 400 });
        }

        if (phone && !/^\d{7,15}$/.test(phone)) {
            return NextResponse.json({ message: "Invalid phone" }, { status: 400 });
        }

        const { data, error: updateError } = await supabase
            .from("profiles")
            .update({
                name,
                lastname,
                phone: phone ?? null,
            })
            .eq("id", user.id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ message: "Couldn't update info" }, { status: 500 });
        }

        return NextResponse.json({
            message: "Profile updated",
            data
        });
    }
    catch (err) {
        return NextResponse.json(
            { message: "Server error :", err },
            { status: 500 }
        );

    }
}