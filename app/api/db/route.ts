import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Profile } from "@/app/types/profile";
import type { Pet } from "@/app/types/pet";

export async function GET() {

    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user || error) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, lastname, role, email, phone, id')
        .eq('id', user.id)
        .single<Profile>()

    if (profileError) {
        return NextResponse.json(
            { error: profileError },
            { status: 500 }
        )
    }

    const { data, error: petsError } = await supabase
        .from('pets')
        .select('id,name,type,last_treatment')
        .eq('owner_id', user.id)

    const pets = data as Pet[]

    if (petsError) {
        return NextResponse.json(
            { error: petsError },
            { status: 500 }
        )
    }

    NextResponse.json({ profile, pets })
}
