import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const VALID_PET_TYPES = ['other', 'dog', 'cat', 'rabbit', 'bird', 'reptile', 'rodent']

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

        const formData = await req.formData()
        const name = String(formData.get('name') ?? '').trim()
        const petType = String(formData.get('pet_type') ?? '').trim().toLowerCase()
        const image = formData.get('image')

        if (name.length === 0 || name.length > 60) {
            return NextResponse.json(
                { error: 'Invalid name' },
                { status: 400 }
            )
        }

        if (!VALID_PET_TYPES.includes(petType)) {
            return NextResponse.json(
                { error: 'Invalid pet type' },
                { status: 400 }
            )
        }

        let uploadedPath: string | null = null
        let imageUrl: string | null = null

        if (image instanceof File && image.size > 0) {
            const hasValidMime = image.type === 'image/jpeg'
            const lowerName = image.name.toLowerCase()
            const hasValidExt = lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')

            if (!hasValidMime && !hasValidExt) {
                return NextResponse.json(
                    { error: 'Only JPG images are allowed' },
                    { status: 400 }
                )
            }

            const extension = lowerName.endsWith('.jpeg') ? 'jpeg' : 'jpg'
            uploadedPath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`
            const bytes = new Uint8Array(await image.arrayBuffer())

            const { error: uploadError } = await supabase
                .storage
                .from('adoption-pets')
                .upload(uploadedPath, bytes, {
                    contentType: 'image/jpeg',
                    upsert: false,
                })

            if (uploadError) {
                return NextResponse.json(
                    { error: uploadError.message },
                    { status: 400 }
                )
            }

            const { data: publicUrlData } = supabase
                .storage
                .from('adoption-pets')
                .getPublicUrl(uploadedPath)

            imageUrl = publicUrlData.publicUrl ?? null
        }

        const { data: inserted, error: insertError } = await supabase
            .from('adoptions')
            .insert({
                name,
                pet_type: petType,
                image: imageUrl,
            })
            .select('*')
            .single()

        if (insertError) {
            if (uploadedPath) {
                await supabase.storage.from('adoption-pets').remove([uploadedPath])
            }

            return NextResponse.json(
                { error: insertError.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: true, adoption: inserted },
            { status: 201 }
        )
    } catch {
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        )
    }
}
