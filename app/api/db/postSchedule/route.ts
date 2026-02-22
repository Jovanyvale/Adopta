import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (!user || authError) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { petId, petType, date } = await req.json()
        const parsedPetId = Number(petId)
        const parsedDate = new Date(date)
        const validPetTypes = ["other", "dog", "cat", "rabbit", "bird", "reptile", "rodent"]

        if (!parsedPetId || Number.isNaN(parsedPetId)) {
            return NextResponse.json(
                { error: "Invalid pet id" },
                { status: 400 }
            )
        }

        if (!validPetTypes.includes(petType)) {
            return NextResponse.json(
                { error: "Invalid pet type" },
                { status: 400 }
            )
        }

        if (Number.isNaN(parsedDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid date" },
                { status: 400 }
            )
        }

        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        const endLimitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59, 999)

        if (parsedDate < now) {
            return NextResponse.json(
                { error: "Date cannot be in the past" },
                { status: 400 }
            )
        }

        if (parsedDate < startOfToday || parsedDate > endLimitDate) {
            return NextResponse.json(
                { error: "Date must be from today up to 3 days ahead" },
                { status: 400 }
            )
        }

        // Verify the pet related to the schedule actually belongs to the loged user
        const { data: pet, error: petError } = await supabase
            .from("pets")
            .select("id")
            .eq("id", parsedPetId)
            .eq("owner_id", user.id)
            .single()

        if (petError || !pet) {
            return NextResponse.json(
                { error: "Pet not found for this user" },
                { status: 404 }
            )
        }

        const { data: activeUserSchedules, error: activeUserSchedulesError } = await supabase
            .from("schedules")
            .select(`
                id,
                date,
                pets!inner(owner_id)
            `)
            .eq("pets.owner_id", user.id)
            .gte("date", now.toISOString())

        if (activeUserSchedulesError) {
            return NextResponse.json(
                { error: activeUserSchedulesError.message },
                { status: 500 }
            )
        }

        if ((activeUserSchedules?.length ?? 0) > 0) {
            return NextResponse.json(
                { error: "User already has an active appointment" },
                { status: 409 }
            )
        }

        const { data: occupiedSlot, error: occupiedSlotError } = await supabase
            .from("schedules")
            .select("id")
            .eq("date", parsedDate.toISOString())
            .maybeSingle()

        if (occupiedSlotError) {
            return NextResponse.json(
                { error: occupiedSlotError.message },
                { status: 500 }
            )
        }

        if (occupiedSlot) {
            return NextResponse.json(
                { error: "Selected slot is already occupied" },
                { status: 409 }
            )
        }

        const { error: scheduleError } = await supabase
            .from("schedules")
            .insert({
                pet_id: parsedPetId,
                animal_type: petType,
                date: parsedDate.toISOString(),
            })

        if (scheduleError) {
            return NextResponse.json(
                { error: scheduleError.message },
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
