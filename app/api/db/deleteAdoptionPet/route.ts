import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function getStoragePathFromPublicUrl(publicUrl: string) {
    const marker = '/storage/v1/object/public/adoption-pets/'
    const markerIndex = publicUrl.indexOf(marker)

    if (markerIndex === -1) {
        return null
    }

    const encodedPath = publicUrl.slice(markerIndex + marker.length).split('?')[0]
    return decodeURIComponent(encodedPath)
}

export async function DELETE(req: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (!user || authError) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json().catch(() => null)
        const adoptionPetId = Number(body?.adoptionPetId)

        if (!Number.isInteger(adoptionPetId) || adoptionPetId <= 0) {
            return NextResponse.json(
                { error: 'Invalid adoption pet id' },
                { status: 400 }
            )
        }

        const { data: adoptionPet, error: adoptionPetError } = await supabase
            .from('adoptions')
            .select('id, name, image')
            .eq('id', adoptionPetId)
            .single()

        if (adoptionPetError || !adoptionPet) {
            return NextResponse.json(
                { error: 'Adoption pet not found' },
                { status: 404 }
            )
        }

        const { error: deleteError } = await supabase
            .from('adoptions')
            .delete()
            .eq('id', adoptionPetId)

        if (deleteError) {
            return NextResponse.json(
                { error: deleteError.message },
                { status: 400 }
            )
        }

        if (adoptionPet.image) {
            const storagePath = getStoragePathFromPublicUrl(adoptionPet.image)
            if (storagePath) {
                await supabase.storage.from('adoption-pets').remove([storagePath])
            }
        }

        const historyUrl = new URL('/api/db/postHistory', req.url)
        const postHistoryRes = await fetch(historyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                cookie: req.headers.get('cookie') ?? ''
            },
            body: JSON.stringify({
                on_table: 'Adoptions',
                details: `Deleted pet: ${adoptionPet.name} #${adoptionPet.id}`
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
    } catch (err) {
        console.log(err)
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        )
    }
}
