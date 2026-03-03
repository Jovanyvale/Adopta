'use client'
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import type { RegisteredService } from "@/app/types/registeredServices"
import type { Schedule } from "@/app/types/schedule"
import { BarChart } from '@mui/x-charts/BarChart';

export default function AdminPanel() {
    const [servicesLast7Days, setServicesLast7Days] = useState<RegisteredService[]>([])
    const [services, setServices] = useState<RegisteredService[]>()
    const [popup, setPopup] = useState('')
    const [petId, setPetId] = useState('')
    const [petType, setPetType] = useState('other')
    const [service, setService] = useState('diagnostic')
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [submitMessage, setSubmitMessage] = useState('')

    const [appointments, setAppointments] = useState<Schedule[]>([])
    const [appointmentsStatus, setAppointmentsStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [appointmentsError, setAppointmentsError] = useState('')
    const [now, setNow] = useState(new Date())

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

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 1000)

        return () => clearInterval(intervalId)
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
        setSubmitMessage('Loading...')

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

            setTimeout(() => {
                setSubmitStatus('idle')
                setSubmitMessage('')
                setPopup('')
            }, 2500);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error posting service'
            setSubmitStatus('error')
            setSubmitMessage(errorMessage)

            setTimeout(() => {
                setSubmitStatus('idle')
                setSubmitMessage('')
                setPopup('')
            }, 2500);
            console.log(err)
        }
    }

    // fetchs and shows the appointments
    async function handleOpenAppointmentsPopup() {
        setPopup('appointments')
        setAppointmentsStatus('loading')
        setAppointmentsError('')

        try {
            const res = await fetch('/api/db/getAllSchedules', {
                method: 'GET',
                credentials: 'include',
            })

            if (!res.ok) {
                throw new Error('Error getting appointments')
            }

            const data = await res.json()
            const nowDate = new Date()
            const orderedSchedules = data
                .filter((schedule: Schedule) => new Date(schedule.date) >= nowDate)
                .sort((a: Schedule, b: Schedule) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((schedule: Schedule) => ({
                    ...schedule,
                    date: new Date(schedule.date),
                }))

            setAppointments(orderedSchedules)
            setAppointmentsStatus('idle')
        } catch (err) {
            setAppointmentsStatus('error')
            setAppointmentsError('Could not load appointments.')
            setAppointments([])
            console.log(err)
        }
    }

    const todayAppointments = appointments.filter((schedule) => {
        const scheduleDate = new Date(schedule.date)
        return (
            scheduleDate.getFullYear() === now.getFullYear() &&
            scheduleDate.getMonth() === now.getMonth() &&
            scheduleDate.getDate() === now.getDate()
        )
    })

    const nextAppointment = appointments.length > 0 ? new Date(appointments[0].date) : null
    const msToNextAppointment = nextAppointment ? nextAppointment.getTime() - now.getTime() : null

    function formatCountdown(milliseconds: number | null) {
        if (milliseconds === null) {
            return 'No upcoming appointment'
        }

        if (milliseconds <= 0) {
            return 'Appointment time reached'
        }

        const totalSeconds = Math.floor(milliseconds / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return `${hours}h ${minutes}m ${seconds}s`
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
                                setPopup('registerService')
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
                        <button
                            type="button"
                            onClick={handleOpenAppointmentsPopup}
                            className="bg-neutral-100 border border-neutral-300 rounded-lg hover:cursor-pointer flex gap-4 px-6 p-4 w-full"
                        >
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
            {popup === 'registerService' && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

                    {/* Shows the status */}
                    {submitStatus === 'loading' && (
                        <div className="w-full max-w-md rounded-xl bg-white p-6 border border-neutral-300 text-center">
                            <p className="text-md font-bold text-neutral-600">{submitMessage}</p>
                        </div>
                    )}
                    {submitStatus === 'success' && (
                        <div className="w-full max-w-md rounded-xl bg-white p-6 border border-neutral-300 text-center items-center flex flex-col gap-2">
                            <div className="w-15 h-15 items-center  relative">
                                <Image src={'/icons/control-panel/check.svg'}
                                    fill
                                    alt="Success icon" />
                            </div>
                            <p className="text-md font-bold text-green-700">{submitMessage}</p>
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="w-full max-w-md rounded-xl bg-white p-6 border border-neutral-300 text-center items-center flex flex-col gap-2">
                            <div className="w-15 h-15 items-center  relative">
                                <Image src={'/icons/control-panel/failure.svg'}
                                    fill
                                    alt="Success icon" />
                            </div>
                            <p className="text-md font-bold text-red-600">{submitMessage}</p>
                        </div>
                    )}


                    {/* Shows the form when the submitStatus is not idle */}
                    {submitStatus == 'idle' &&
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
                                            setPopup('')
                                            setSubmitStatus('idle')
                                            setSubmitMessage('')
                                        }}
                                        className="w-full p-2 rounded-lg bg-neutral-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full p-2 rounded-lg bg-black text-white"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    }
                </div >
            )
            }

            {popup === 'appointments' && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white border-2 border-black rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-black">Appointments schedule</h3>
                            <button
                                type="button"
                                onClick={() => setPopup('')}
                                className="text-white bg-black rounded-md px-3 py-1 border border-red-500 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>

                        {appointmentsStatus === 'loading' && (
                            <p className="text-black font-semibold">Loading appointments...</p>
                        )}

                        {appointmentsStatus === 'error' && (
                            <p className="text-red-600 font-semibold">{appointmentsError}</p>
                        )}

                        {appointmentsStatus === 'idle' && (
                            <>
                                <div className="bg-white border border-black rounded-lg p-4 mb-4">
                                    <p className="text-black font-semibold">
                                        Time left for next appointment
                                        <span className="inline-block w-2 h-2 rounded-full bg-red-600 ml-2 align-middle" />
                                    </p>
                                    <p className="text-2xl text-black font-bold">
                                        {formatCountdown(msToNextAppointment)}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-lg font-bold text-black mb-2">Today schedules</p>
                                    {todayAppointments.length > 0 ? (
                                        <ul className="space-y-2">
                                            {todayAppointments.map((schedule) => (
                                                <li
                                                    key={schedule.id}
                                                    className="border border-black rounded-lg p-3 bg-white text-black border-l-4 border-l-red-500"
                                                >
                                                    Pet #{schedule.pet_id} ({schedule.animal_type})
                                                    - {new Intl.DateTimeFormat('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    }).format(new Date(schedule.date))}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-black">No schedules for today.</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-lg font-bold text-black mb-2">All upcoming schedules</p>
                                    {appointments.length > 0 ? (
                                        <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                            {appointments.map((schedule) => (
                                                <li
                                                    key={schedule.id}
                                                    className="border border-black rounded-lg p-3 bg-white text-black border-l-4 border-l-red-500"
                                                >
                                                    Pet #{schedule.pet_id} ({schedule.animal_type})
                                                    - {new Intl.DateTimeFormat('en-US', {
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
                                        <p className="text-black">No upcoming schedules.</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

        </>
    )
}
