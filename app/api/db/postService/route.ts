import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (!user || authError) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { petId, petType, service } = await req.json()
        const normalizedPetId = String(petId ?? "").trim()
        const validPetTypes = ["other", "dog", "cat", "rabbit", "bird", "reptile", "rodent"]
        const validServices = [
            "diagnostic",
            "microchipping",
            "sterilization",
            "vaccination",
            "dental care",
            "surgery",
            "emergency care",
            "grooming",
        ]

        let parsedPetId: number | null = null
        if (normalizedPetId !== "") {
            if (!/^\d{1,6}$/.test(normalizedPetId)) {
                return NextResponse.json(
                    { error: 'Invalid petId' },
                    { status: 400 }
                )
            }
            parsedPetId = Number(normalizedPetId)
        }

        if (!validPetTypes.includes(petType)) {
            return NextResponse.json(
                { error: "Invalid pet type" },
                { status: 400 }
            )
        }

        if (!validServices.includes(service)) {
            return NextResponse.json(
                { error: "Invalid service" },
                { status: 400 }
            )
        }

        const { error: serviceError } = await supabase
            .from("services")
            .insert({
                pet_id: parsedPetId,
                animal_type: petType,
                service,
            })

        if (serviceError) {
            return NextResponse.json(
                { error: serviceError.message },
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
