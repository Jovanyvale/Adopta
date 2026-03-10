import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, lastname, role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'Unable to get user profile' },
                { status: 401 }
            )
        }

        if (profile.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }

        const body = await req.json().catch(() => null) as {
            on_table: string
            details: string
        } | null

        if (!body) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            )
        }

        const admin = `${profile.name ?? ''} ${profile.lastname ?? ''}`.trim()
        const admin_id = profile.id
        const on_table = String(body.on_table).trim()
        const details = String(body.details).trim()

        if (!admin) {
            return NextResponse.json(
                { error: 'Admin info not provided' },
                { status: 401 }
            )
        }

        if (!admin_id) {
            return NextResponse.json(
                { error: 'Invalid admin id' },
                { status: 401 }
            )

        }

        if (!on_table) {
            return NextResponse.json(
                { error: 'No table specified' },
                { status: 406 }
            )
        }

        if (!details) {
            return NextResponse.json(
                { error: 'No details provided' },
                { status: 406 }
            )
        }

        const { error: historyInsertError } = await supabase
            .from('history')
            .insert({
                admin,
                admin_id,
                on_table,
                details
            })

        if (historyInsertError) {
            return NextResponse.json(
                { error: historyInsertError.message },
                { status: 400 }
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
