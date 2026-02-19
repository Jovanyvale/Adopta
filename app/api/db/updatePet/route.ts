import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const supabase = await createClient()

        const { data: userData, error } = await supabase.auth.getUser()

        if (!userData || error) {
            return NextResponse.json({ error: 'Error getting user data' }, { status: 401 })
        }

        const { petName, petType, petId } = await req.json()
        const validPetTypes = ['other', 'dog', 'cat', 'rabbit', 'bird', 'reptile', 'rodent']

        if (petName.length <= 0 || petName.length > 16) {
            return NextResponse.json(
                { error: 'Invalid name' },
                { status: 400 },
            )
        }

        if (!validPetTypes.includes(petType)) {
            return NextResponse.json(
                { error: 'Invalid pet type' },
                { status: 400 }
            )
        }

        const { error: updateError } = await supabase
            .from('pets')
            .update(
                {
                    name: petName,
                    type: petType,
                }
            )
            .eq('id', petId)

        if (updateError) {
            return NextResponse.json(
                { updateError },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (err) {
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        )
    }
}