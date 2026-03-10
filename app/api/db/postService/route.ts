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
        const prices = {
            diagnostic: 30,
            microchipping: 140,
            sterilization: 240,
            vaccination: 200,
            dental_care: 100,
            surgery: 400,
            emergency_care: 150,
            grooming: 50
        } as const;

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
        const serviceKey = service.trim().toLowerCase().replace(/\s+/g, "_")
        if (!(serviceKey in prices)) {
            return NextResponse.json(
                { error: "Price not found for service" },
                { status: 400 }
            )
        }
        
        const earn = prices[serviceKey as keyof typeof prices]
        const { error: serviceError } = await supabase
            .from("services")
            .insert({
                pet_id: parsedPetId,
                animal_type: petType,
                service,
                earn
            })

        if (serviceError) {
            return NextResponse.json(
                { error: serviceError.message },
                { status: 400 }
            )
        }

        const historyUrl = new URL('/api/db/postHistory', req.url)
        const postHistoryRes = await fetch(historyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                cookie: req.headers.get('cookie') ?? ''
            },
            body: JSON.stringify({
                on_table: 'Services',
                details: `Registered service: ${service} (${petType}) for pet #${parsedPetId ?? 'N/A'}`
            })
        })

        if (!postHistoryRes.ok) {
            const data = await postHistoryRes.json().catch(() => null)
            return NextResponse.json(
                { error: data?.error ?? 'Unable to register audit history' },
                { status: postHistoryRes.status }
            )
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        )
    }
}
