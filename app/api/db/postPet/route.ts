import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (!user || authError) {
            return (
                NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                )
            )
        }

        const { petName, petType } = await req.json()
        const validPetTypes = ['other', 'dog', 'cat', 'rabbit', 'bird', 'reptile', 'rodent']

        if (petName.length <= 0 || petName.length > 16) {
            return NextResponse.json(
                { error: 'Invalid name' },
                { status: 400 }
            )
        }

        if (!validPetTypes.includes(petType)) {
            return NextResponse.json(
                { error: 'Invalid pet type' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('pets')
            .insert(
                {
                    name: petName,
                    type: petType,
                    owner_id: user.id
                }
            )

        if (error) {
            return NextResponse.json(
                { error },
                { status: 400 }
            )
        }

        return NextResponse.json(error)


        //Return a null or error

    } catch (err) {
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        )
    }
}