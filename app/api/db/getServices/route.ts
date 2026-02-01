import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

//Get all services rows related to user's pets 

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

    //Get services rows from the database
    const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')

    if (servicesError) {
        return NextResponse.json(
            { error: servicesError },
            { status: 500 }
        )
    }

    return NextResponse.json(services)
}