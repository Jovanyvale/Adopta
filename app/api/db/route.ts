import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Profile } from "@/app/types/profile";
import type { Pet } from "@/app/types/pet";

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

    //Get the own profile from the database
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

    //Get the owners pets from the database
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

    return NextResponse.json({ profile, pets })
}
