'use client'
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import type { RegisteredService } from "@/app/types/registeredServices"
import { BarChart } from '@mui/x-charts/BarChart';

export default function AdminPanel() {
    const [servicesLast7Days, setServicesLast7Days] = useState<RegisteredService[]>([])
    const [services, setServices] = useState<RegisteredService[]>()
    const [showRegisterServicePopup, setShowRegisterServicePopup] = useState(false)
    const [petId, setPetId] = useState('')
    const [petType, setPetType] = useState('other')
    const [service, setService] = useState('diagnostic')
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [submitMessage, setSubmitMessage] = useState('')

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

        async function getServices() {
            try {
                const res = await fetch('/api/db/getServices', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    throw new Error('Error services')
                }

                const data = await res.json()
                setServices(data)
            } catch (err) {
                console.log(err)
            }
        }
        getServices()
    }, [])

    function handlePetIdChange(e: ChangeEvent<HTMLInputElement>) {
        const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 6)
        setPetId(onlyNumbers)
    }

    async function handleRegisterServiceSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (submitStatus === 'loading') {
            return
        }

        setSubmitStatus('loading')
        setSubmitMessage('')

        try {
            const res = await fetch('/api/db/postService', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    petId,
                    petType,
                    service,
                }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => null)
                throw new Error(data?.error ?? 'Error posting service')
            }

            setPetId('')
            setPetType('other')
            setService('diagnostic')
            setSubmitStatus('success')
            setSubmitMessage('Service submitted successfully.')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error posting service'
            setSubmitStatus('error')
            setSubmitMessage(errorMessage)
            console.log(err)
        }
    }

    return (
        <>
            <div className="md:w-[80%] w-[95%] mx-auto">
                <h2 className="text-xl text-neutral-800 mt-10 mb-4">Admin dashboard</h2>
                <div className="grid grid-cols-5 grid-rows-7 gap-4">
                    <div className="col-span-2 row-span-4 w-[90%] mx-auto flex flex-col gap-3">

                        {/* Register service button */}
                        <button
                            type="button"
                            className="bg-neutral-100 border border-neutral-300 rounded-lg hover:cursor-pointer flex gap-4 px-6 p-4 w-full"
                            onClick={() => {
                                setShowRegisterServicePopup(true)
                                setSubmitStatus('idle')
                                setSubmitMessage('')
                            }}
                        >
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

                    {/* Bar chart */}
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

                    {/* Services list */}
                    <div className="col-span-5 row-span-3 col-start-1 row-start-5">

                    </div>
                </div>
            </div>

            {/*Register service Popup */}
            {showRegisterServicePopup && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 border border-neutral-300">
                        <h3 className="text-xl text-neutral-800 mb-4">Register service</h3>

                        <form onSubmit={handleRegisterServiceSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="petId" className="text-sm text-neutral-700">Pet ID</label>
                                <input
                                    id="petId"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    pattern="[0-9]{1,6}"
                                    value={petId}
                                    onChange={handlePetIdChange}
                                    className="p-2 rounded-lg border border-neutral-300"
                                    placeholder="Only numbers"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="petType" className="text-sm text-neutral-700">Pet type</label>
                                <select
                                    id="petType"
                                    value={petType}
                                    onChange={(e) => setPetType(e.target.value)}
                                    className="p-2 rounded-lg border border-neutral-300"
                                >
                                    <option value="other">Other</option>
                                    <option value="dog">Dog</option>
                                    <option value="cat">Cat</option>
                                    <option value="rabbit">Rabbit</option>
                                    <option value="bird">Bird</option>
                                    <option value="reptile">Reptile</option>
                                    <option value="rodent">Rodent</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="service" className="text-sm text-neutral-700">Service</label>
                                <select
                                    id="service"
                                    value={service}
                                    onChange={(e) => setService(e.target.value)}
                                    className="p-2 rounded-lg border border-neutral-300"
                                >
                                    <option value="diagnostic">Diagnostic</option>
                                    <option value="microchipping">Microchipping</option>
                                    <option value="sterilization">Sterilization</option>
                                    <option value="vaccination">Vaccination</option>
                                    <option value="dental care">Dental care</option>
                                    <option value="surgery">Surgery</option>
                                    <option value="emergency care">Emergency care</option>
                                    <option value="grooming">Grooming</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRegisterServicePopup(false)
                                        setSubmitStatus('idle')
                                        setSubmitMessage('')
                                    }}
                                    className="w-full p-2 rounded-lg bg-neutral-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitStatus === 'loading'}
                                    className="w-full p-2 rounded-lg bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitStatus === 'loading' ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>

                            {submitStatus === 'success' && (
                                <p className="text-sm text-green-700">{submitMessage}</p>
                            )}
                            {submitStatus === 'error' && (
                                <p className="text-sm text-red-600">{submitMessage}</p>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
