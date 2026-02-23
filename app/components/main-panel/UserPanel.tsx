'use client'
import SpotlightCard from "../SpotlightCard"
import { useEffect, useState } from "react";
import { RegisteredService } from "@/app/types/registeredServices";
import type { Schedule } from "@/app/types/schedule";
import { useAuth } from "@/app/context/AuthContext";

export default function UserPanel() {
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [services, setServices] = useState<RegisteredService[]>([])
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
        </div>
    )
}
