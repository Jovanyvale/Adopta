'use client'
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import type { RegisteredService } from "@/app/types/registeredServices"
import { BarChart } from '@mui/x-charts/BarChart';

export default function AdminPanel() {
    const [servicesLast7Days, setServicesLast7Days] = useState<RegisteredService[]>([])

    const valueFormatter = (value: number | null) => {
        return `${value ?? 0} services`
    }

    const chartData = useMemo(() => {
        const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
        const now = new Date()
        const days = Array.from({ length: 7 }, (_, index) => {
            const date = new Date()
            date.setDate(now.getDate() - (6 - index))
            const ymd = date.toISOString().slice(0, 10)
            return {
                ymd,
                day: formatter.format(date),
                services: 0,
            }
        })

        const servicesCountByDay = servicesLast7Days.reduce<Record<string, number>>((acc, service) => {
            const ymd = new Date(service.created_at).toISOString().slice(0, 10)
            acc[ymd] = (acc[ymd] ?? 0) + 1
            return acc
        }, {})

        return days.map((day) => ({
            day: day.day,
            services: servicesCountByDay[day.ymd] ?? 0,
        }))
    }, [servicesLast7Days])

    useEffect(() => {
        async function getLast7DaysServices() {
            try {
                const res = await fetch('/api/db/getServices/getLast7DaysServices', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    throw new Error('Error getting last 7 days services')
                }

                const data = await res.json()
                setServicesLast7Days(data)
            } catch (err) {
                console.log(err)
            }
        }

        getLast7DaysServices()
    }, [])

    return (
        <>
            <div className="md:w-[80%] w-[95%] mx-auto">
                <h2 className="text-xl text-neutral-800 mt-10 mb-4">Admin dashboard</h2>
                <div className="grid grid-cols-5 grid-rows-7 gap-4">
                    <div className="col-span-2 row-span-4 w-[90%] mx-auto flex flex-col gap-3">

                        {/* Register service button */}
                        <button className="bg-neutral-100 border border-neutral-300 rounded-lg hover:cursor-pointer flex gap-4 px-6 p-4 w-full">
                            <div className="w-16 h-16 bg-blue-500 rounded-lg relative flex items-center justify-center">
                                <Image src={'/icons/admin-panel/add-icon.svg'}
                                    alt="Register service icon"
                                    width={50}
                                    height={50}
                                />
                            </div>
                            <p className="text-neutral-800 semibold text-xl self-center">Register service</p>
                        </button>

                        {/* Appointments button */}
                        <button className="bg-neutral-100 border border-neutral-300 rounded-lg hover:cursor-pointer flex gap-4 px-6 p-4 w-full">
                            <div className="w-16 h-16 bg-red-500 rounded-lg relative flex items-center justify-center">
                                <Image src={'/icons/admin-panel/appointments-icon.svg'}
                                    alt="Register service icon"
                                    width={50}
                                    height={50}
                                />
                            </div>
                            <p className="text-neutral-800 semibold text-xl self-center">Appointments</p>
                        </button>

                        {/* Add adoption pet button */}
                        <button className="bg-neutral-100 border border-neutral-300 rounded-lg hover:cursor-pointer flex gap-4 px-6 p-4 w-full">
                            <div className="w-16 h-16 bg-black rounded-lg relative flex items-center justify-center">
                                <Image src={'/icons/admin-panel/pet-adoption-icon.svg'}
                                    alt="Register service icon"
                                    width={50}
                                    height={50}
                                />
                            </div>
                            <p className="text-neutral-800 semibold text-xl self-center">Add adoption pet</p>
                        </button>

                    </div>

                    <div className="col-span-3 row-span-4 col-start-3 row-start-1">
                        <BarChart
                            dataset={chartData}
                            xAxis={[{ dataKey: 'day' }]}
                            yAxis={[{ label: 'Services', width: 50 }]}
                            series={[{ dataKey: 'services', label: 'Last 7 days', valueFormatter }]}
                            height={300}
                            margin={{ left: 0 }}
                        />
                    </div>

                    <div className="col-span-5 row-span-3 col-start-1 row-start-5">3</div>
                </div>
            </div>
        </>
    )
}
