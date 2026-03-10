import { Suspense } from "react"
import AppointmentsClient from "./AppointmentsClient"

export const dynamic = 'force-dynamic'


export default async function Appointments() {
    return (
        <Suspense fallback={<div className="w-[92%] max-w-4xl mx-auto mt-10 mb-16">Loading appointments...</div>}>
            <AppointmentsClient />
        </Suspense>
    )
}
