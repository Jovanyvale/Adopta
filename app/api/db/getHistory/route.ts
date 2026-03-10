import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(req.url)

        const limitParam = searchParams.get('limit')
        const offsetParam = searchParams.get('offset')
        const parsedLimit = limitParam ? Number(limitParam) : 20
        const parsedOffset = offsetParam ? Number(offsetParam) : 0
        const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(Math.floor(parsedLimit), 1), 100) : 20
        const offset = Number.isFinite(parsedOffset) ? Math.max(Math.floor(parsedOffset), 0) : 0

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (!user || authError) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role')
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

        const { data: history, error: historyError } = await supabase
            .from('history')
            .select('*')
            .order('id', { ascending: false })
            .range(offset, offset + limit - 1)

        if (historyError) {
            return NextResponse.json(
                { error: historyError.message },
                { status: 500 }
            )
        }

        return NextResponse.json(history ?? [])
    } catch {
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        )
    }
}
