'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type SubmitStatus = "idle" | "loading" | "success" | "error"

function buildTimeSlots() {
    const slots: string[] = []
    for (let hour = 10; hour <= 17; hour++) {
        for (const minute of [0, 30]) {
            if (hour === 17 && minute === 30) continue

            const hh = String(hour).padStart(2, "0")
            const mm = String(minute).padStart(2, "0")
            slots.push(`${hh}:${mm}`)
        }
    }
    return slots
}

function getDateAtTime(dateValue: string, timeValue: string) {
    const [year, month, day] = dateValue.split("-").map(Number)
    const [hour, minute] = timeValue.split(":").map(Number)
    return new Date(year, month - 1, day, hour, minute, 0, 0)
}

function getYmdDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")}`
}

export default function AppointmentsClient({
    petId,
    petType,
}: {
    petId: string | null
    petType: string | null
}) {
    const router = useRouter()

    const today = useMemo(() => getYmdDate(new Date()), [])
    const maxDate = useMemo(() => {
        const limitDate = new Date()
        limitDate.setDate(limitDate.getDate() + 3)
        return getYmdDate(limitDate)
    }, [])

    const [selectedDate, setSelectedDate] = useState(today)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle")
    const [submitMessage, setSubmitMessage] = useState("")
    const [allSchedules, setAllSchedules] = useState<{ date: string }[]>([])
    const [hasActiveUserSchedule, setHasActiveUserSchedule] = useState(false)

    const timeSlots = useMemo(() => buildTimeSlots(), [])
    const now = new Date()

    const occupiedSlots = useMemo(() => {
        const slots = new Set<string>()

        for (const schedule of allSchedules) {
            const scheduleDate = new Date(schedule.date)

            if (getYmdDate(scheduleDate) !== selectedDate) continue

            const hh = String(scheduleDate.getHours()).padStart(2, "0")
            const mm = String(scheduleDate.getMinutes()).padStart(2, "0")

            slots.add(`${hh}:${mm}`)
        }

        return slots
    }, [allSchedules, selectedDate])

    useEffect(() => {
        async function getCalendarData() {
            try {
                const [allSchedulesRes, userSchedulesRes] = await Promise.all([
                    fetch("/api/db/getAllSchedules", {
                        method: "GET",
                        credentials: "include",
                    }),
                    fetch("/api/db/getSchedules", {
                        method: "GET",
                        credentials: "include",
                    }),
                ])

                if (allSchedulesRes.ok) {
                    const data = await allSchedulesRes.json()
                    setAllSchedules(data)
                }

                if (userSchedulesRes.ok) {
                    const data = await userSchedulesRes.json()

                    const hasActive = data.some(
                        (schedule: { date: string }) =>
                            new Date(schedule.date) >= new Date()
                    )

                    setHasActiveUserSchedule(hasActive)
                }
            } catch (error) {
                console.log(error)
            }
        }

        getCalendarData()
    }, [])

    useEffect(() => {
        if (!selectedTime) return

        if (occupiedSlots.has(selectedTime)) {
            setSelectedTime(null)
        }
    }, [occupiedSlots, selectedTime])

    async function handleConfirmAppointment() {
        if (!petId || !petType || !selectedDate || !selectedTime) {
            setSubmitStatus("error")
            setSubmitMessage("Missing pet information or selected slot.")
            return
        }

        if (hasActiveUserSchedule) {
            setSubmitStatus("error")
            setSubmitMessage(
                "You already have an active appointment and cannot schedule another one yet."
            )
            return
        }

        if (occupiedSlots.has(selectedTime)) {
            setSubmitStatus("error")
            setSubmitMessage("This time slot is already occupied.")
            return
        }

        const scheduleDate = getDateAtTime(selectedDate, selectedTime)

        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const endLimitDate = new Date()
        endLimitDate.setHours(23, 59, 59, 999)
        endLimitDate.setDate(endLimitDate.getDate() + 3)

        if (scheduleDate < new Date()) {
            setSubmitStatus("error")
            setSubmitMessage("You cannot create appointments in the past.")
            return
        }

        if (scheduleDate < startOfToday || scheduleDate > endLimitDate) {
            setSubmitStatus("error")
            setSubmitMessage(
                "Appointments can only be scheduled from today to 3 days ahead."
            )
            return
        }

        setSubmitStatus("loading")

        try {
            const res = await fetch("/api/db/postSchedule", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    petId: Number(petId),
                    petType,
                    date: scheduleDate.toISOString(),
                }),
            })

            if (!res.ok) throw new Error()

            setSubmitStatus("success")
            setSubmitMessage("Appointment created successfully.")
            setShowConfirm(false)

            setTimeout(() => {
                router.push("/main-panel/pets")
            }, 1200)
        } catch {
            setSubmitStatus("error")
            setSubmitMessage("Could not create appointment. Please try again.")
        }
    }

    const hasPetParams = Boolean(petId && petType)

    return (
        <div className="w-[92%] max-w-4xl mx-auto mt-10 mb-16">
            <div className="rounded-2xl bg-neutral-100 border border-neutral-300 p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-center">Appointments</h1>
                <p className="text-center text-sm md:text-base text-neutral-700 mt-2">
                    Select a date and a time slot between 10:00 and 17:00.
                    You can only book from today to 3 days ahead.
                </p>

                {!hasPetParams && (
                    <p className="mt-5 text-center text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                        Missing pet data. Open this page from your pet card to schedule an appointment.
                    </p>
                )}

                {hasPetParams && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <p className="text-sm bg-white border border-neutral-300 rounded-md px-3 py-1">
                            Pet ID: <span className="font-semibold">{petId}</span>
                        </p>
                        <p className="text-sm bg-white border border-neutral-300 rounded-md px-3 py-1 capitalize">
                            Type: <span className="font-semibold">{petType}</span>
                        </p>
                    </div>
                )}
                {hasActiveUserSchedule && (
                    <p className="mt-5 text-center text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                        You already have an active appointment. You cannot schedule another one yet.
                    </p>
                )}

                <div className="mt-6">
                    <label htmlFor="date" className="block text-sm font-medium text-neutral-800 mb-2">
                        Date
                    </label>
                    <input
                        id="date"
                        type="date"
                        min={today}
                        max={maxDate}
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value)
                            setSelectedTime(null)
                        }}
                        className="w-full md:w-72 rounded-lg border border-neutral-300 p-2 bg-white"
                    />
                </div>

                <div className="mt-6">
                    <p className="text-sm font-medium text-neutral-800 mb-3">Available times</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {timeSlots.map((slot) => {
                            const slotDate = getDateAtTime(selectedDate, slot)
                            const isPastSlot = slotDate < now
                            const isOccupied = occupiedSlots.has(slot)
                            const isBlocked = isPastSlot || isOccupied || hasActiveUserSchedule

                            return (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedTime(slot)}
                                    disabled={isBlocked}
                                    className={`rounded-lg border p-3 text-center transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${selectedTime === slot
                                        ? "bg-black text-white border-black"
                                        : isOccupied
                                            ? "bg-red-500 text-white border-red-500"
                                            : "bg-white border-neutral-300 hover:bg-neutral-200 hover:cursor-pointer"
                                        }`}
                                >
                                    {slot}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 hover:cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        disabled={!selectedTime || !hasPetParams || submitStatus === "loading" || hasActiveUserSchedule}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                    >
                        Confirm appointment
                    </button>
                </div>

                {submitStatus === "success" && (
                    <p className="mt-4 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                        {submitMessage}
                    </p>
                )}
                {submitStatus === "error" && (
                    <p className="mt-4 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                        {submitMessage}
                    </p>
                )}
            </div>

            {showConfirm && selectedTime && (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center px-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <p className="text-lg font-semibold">Confirm appointment</p>
                        <p className="text-sm text-neutral-700 mt-2">
                            Pet ID <span className="font-semibold">{petId}</span> ({petType}) on{" "}
                            <span className="font-semibold">{selectedDate}</span> at{" "}
                            <span className="font-semibold">{selectedTime}</span>.
                        </p>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-100 hover:cursor-pointer"
                                onClick={() => setShowConfirm(false)}
                                disabled={submitStatus === "loading"}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="flex-1 rounded-lg bg-black text-white px-3 py-2 text-sm hover:cursor-pointer disabled:opacity-70"
                                onClick={handleConfirmAppointment}
                                disabled={submitStatus === "loading"}
                            >
                                {submitStatus === "loading" ? "Saving..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}