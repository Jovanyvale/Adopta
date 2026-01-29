import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

//Get ALL schedules

export async function GET() {
    const supabase = await createClient()

    //Get the user info
    const { data: { user }, error } = await supabase.auth.getUser()

    //If couldn't get user return an error
    if (!user || error) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    //Get schedules from the database
    const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select(`
                id,
                pet_id,
                animal_type,
                date
            `)

    if (schedulesError) {
        return NextResponse.json(
            { error: schedulesError },
            { status: 500 }
        )
    }

    return NextResponse.json(schedules)
}