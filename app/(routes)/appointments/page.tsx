import { Suspense } from "react"
import AppointmentsClient from "./AppointmentsClient"

export const dynamic = 'force-dynamic'

type SearchParams = {
    petId?: string
    petType?: string
}

export default async function Appointments({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams

    return (
        <Suspense fallback={<div className="w-[92%] max-w-4xl mx-auto mt-10 mb-16">Loading appointments...</div>}>
            <AppointmentsClient
                petId={params.petId ?? null}
                petType={params.petType ?? null}
            />
        </Suspense>
    )
}
