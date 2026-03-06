import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

//Get all services rows related to user's pets 

export async function GET(req: Request) {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')
    const parsedLimit = limitParam ? Number(limitParam) : null
    const parsedOffset = offsetParam ? Number(offsetParam) : 0
    const limit = parsedLimit !== null && Number.isFinite(parsedLimit) ? Math.min(Math.max(Math.floor(parsedLimit), 1), 100) : null
    const offset = Number.isFinite(parsedOffset) ? Math.max(Math.floor(parsedOffset), 0) : 0

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
    let servicesQuery = supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

    if (limit !== null) {
        servicesQuery = servicesQuery.range(offset, offset + limit - 1)
    }

    const { data: services, error: servicesError } = await servicesQuery

    if (servicesError) {
        return NextResponse.json(
            { error: servicesError },
            { status: 500 }
        )
    }

    return NextResponse.json(services)
}
