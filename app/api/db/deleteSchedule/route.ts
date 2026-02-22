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

        const { petId, scheduleId } = await req.json()
        const parsedPetId = Number(petId)
        const parsedScheduleId = Number(scheduleId)

        if (!parsedPetId || Number.isNaN(parsedPetId)) {
            return NextResponse.json(
                { error: "Invalid pet id" },
                { status: 400 }
            )
        }

        if (!parsedScheduleId || Number.isNaN(parsedScheduleId)) {
            return NextResponse.json(
                { error: "Invalid schedule id" },
                { status: 400 }
            )
        }

        const { data: schedule, error: scheduleError } = await supabase
            .from("schedules")
            .select(`
                id,
                pet_id,
                pets!inner(owner_id)
            `)
            .eq("id", parsedScheduleId)
            .eq("pet_id", parsedPetId)
            .eq("pets.owner_id", user.id)
            .single()

        if (scheduleError || !schedule) {
            return NextResponse.json(
                { error: "Schedule not found for this user and pet" },
                { status: 404 }
            )
        }

        const { error: deleteError } = await supabase
            .from("schedules")
            .delete()
            .eq("id", parsedScheduleId)

        if (deleteError) {
            return NextResponse.json(
                { error: deleteError.message },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        )
    }
}
