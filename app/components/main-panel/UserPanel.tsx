'use client'
import SpotlightCard from "../SpotlightCard"
import { useEffect, useState } from "react";
import { RegisteredService } from "@/app/types/registeredServices";
import type { Schedule } from "@/app/types/schedule";
import { useAuth } from "@/app/context/AuthContext";

export default function UserPanel() {
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [services, setServices] = useState<RegisteredService[]>([])
    const [showSchedulesPopup, setShowSchedulesPopup] = useState(false)
    const [now, setNow] = useState(new Date())
    const { user, loading, error } = useAuth();

    const nowDate = new Date();

    useEffect(() => {
        //Gets the schedules related to the users pet------
        async function getSchedules() {
            try {
                const res = await fetch('/api/db/getSchedules', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    throw new Error('Error getting schedules')
                }
                const data = await res.json()

                //Order the schedules and filter passed ones
                const orderedSchedules = data
                    .filter((a: Schedule) => new Date(a.date) >= nowDate)
                    .sort((a: Schedule, b: Schedule) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((a: Schedule) => {
                        return ({ ...a, date: new Date(a.date) })
                    })

                setSchedules(orderedSchedules)
            } catch (err) {
                console.log(err)
            }
        }
        getSchedules();

        //Gets the services related to the users pet------
        async function getServices() {
            try {
                const res = await fetch('/api/db/getServices', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    throw new Error('Error getting services')
                }
                const data = await res.json()

                //Order the services
                const orderedServices = data.sort((a: RegisteredService, b: RegisteredService) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )

                setServices(orderedServices)
            } catch (err) {
                console.log(err)
            }
        }
        getServices();
    }, [])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 1000)

        return () => clearInterval(intervalId)
    }, [])

    const todaySchedules = schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.date)
        return (
            scheduleDate.getFullYear() === now.getFullYear() &&
            scheduleDate.getMonth() === now.getMonth() &&
            scheduleDate.getDate() === now.getDate()
        )
    })

    const nextSchedule = schedules.length > 0 ? new Date(schedules[0].date) : null
    const msToNextAppointment = nextSchedule ? nextSchedule.getTime() - now.getTime() : null

    function formatCountdown(milliseconds: number | null) {
        if (milliseconds === null) {
            return "No upcoming appointment"
        }

        if (milliseconds <= 0) {
            return "Appointment time reached"
        }

        const totalSeconds = Math.floor(milliseconds / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return `${hours}h ${minutes}m ${seconds}s`
    }

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="md:grid md:grid-cols-5 md:grid-rows-7 flex flex-col gap-4 w-[90%] mx-auto mt-16 font-semibold md:text-xl text-center">
            {/* 1 — Welcome */}
            < SpotlightCard className="col-span-5 row-span-2 md:text-5xl flex flex-col items-center justify-center p-10" >
                <p>Welcome</p>
                <p>{user?.profile.name}</p>
            </SpotlightCard >

            {/* 2 — Next appointment */}
            < SpotlightCard className="col-span-3 row-span-5 row-start-3 flex flex-col gap-2 items-center justify-center bg-neutral-100" >
                <p>Next appointment</p>
                <p className="bg-red-500 text-white p-3 rounded-full">
                    {schedules.length > 0
                        ? new Intl.DateTimeFormat('en-US', {
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                        }).format(new Date(schedules[0].date))
                        : "You don't have any appointments scheduled."
                    }
                </p>
                <button
                    type="button"
                    onClick={() => setShowSchedulesPopup(true)}
                    className="bg-white text-red-600 border border-red-500 rounded-lg px-4 py-2 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                >
                    Upcoming schedules
                </button>
            </SpotlightCard >

            {/* 4 — Last services */}
            < SpotlightCard className="col-span-2 row-span-5 col-start-4 row-start-3 flex flex-col" >
                <p>Last services</p>
                <div className="flex flex-col justify-around h-full">
                    {services.slice(0, 3).map(service => (
                        <div
                            key={service.id}
                            className="flex flex-col bg-neutral-300 rounded-lg p-2"
                        >
                            <p>
                                {service.service.charAt(0).toUpperCase() +
                                    service.service.slice(1)}
                            </p>
                            <p className="text-md font-light">
                                {new Date(service.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </SpotlightCard >

            {showSchedulesPopup && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white border-2 border-red-600 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-red-600">Upcoming schedules</h3>
                            <button
                                type="button"
                                onClick={() => setShowSchedulesPopup(false)}
                                className="text-white bg-red-600 rounded-md px-3 py-1 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-700 font-semibold">Time left for next appointment</p>
                            <p className="text-2xl text-red-600 font-bold">
                                {formatCountdown(msToNextAppointment)}
                            </p>
                        </div>

                        <div className="mb-4">
                            <p className="text-lg font-bold text-red-600 mb-2">Today schedules</p>
                            {todaySchedules.length > 0 ? (
                                <ul className="space-y-2">
                                    {todaySchedules.map((schedule) => (
                                        <li
                                            key={schedule.id}
                                            className="border border-red-300 rounded-lg p-3 bg-white text-red-700"
                                        >
                                            {new Intl.DateTimeFormat('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                            }).format(new Date(schedule.date))}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-red-700">No schedules for today.</p>
                            )}
                        </div>

                        <div>
                            <p className="text-lg font-bold text-red-600 mb-2">All upcoming schedules</p>
                            {schedules.length > 0 ? (
                                <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {schedules.map((schedule) => (
                                        <li
                                            key={schedule.id}
                                            className="border border-red-300 rounded-lg p-3 bg-white text-red-700"
                                        >
                                            {new Intl.DateTimeFormat('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                            }).format(new Date(schedule.date))}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-red-700">No upcoming schedules.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
