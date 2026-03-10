'use client'
import Image from "next/image"
import { UIEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import type { HistoryRecord } from "@/app/types/historyRecord"
import type { RegisteredService } from "@/app/types/registeredServices"
import type { Schedule } from "@/app/types/schedule"
import { BarChart } from '@mui/x-charts/BarChart';
import SpotlightCard from "../SpotlightCard"

type PopupState = '' | 'registerService' | 'appointments' | 'showServices' | 'addAdoptionPet' | 'auditHistory'
const SERVICES_PAGE_SIZE = 20
const AUDIT_HISTORY_PAGE_SIZE = 20
type AdoptionPet = {
    id: number | string
    name: string
    pet_type: string | null
    image: string | null
}

export default function AdminPanel() {
    // Dashboard data
    const [servicesLast7Days, setServicesLast7Days] = useState<RegisteredService[]>([])
    const [services, setServices] = useState<RegisteredService[]>([])
    const [now, setNow] = useState(new Date())

    // Global popup state
    const [popup, setPopup] = useState<PopupState>('')

    // "Register service" popup form state
    const [petId, setPetId] = useState('')
    const [petType, setPetType] = useState('other')
    const [service, setService] = useState('diagnostic')
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [submitMessage, setSubmitMessage] = useState('')

    // "Show services" popup state (infinite scroll list)
    const [popupServices, setPopupServices] = useState<RegisteredService[]>([])
    const [popupServicesLoading, setPopupServicesLoading] = useState(false)
    const [popupServicesHasMore, setPopupServicesHasMore] = useState(true)
    const [popupServicesError, setPopupServicesError] = useState('')

    // "Audit history" popup state (infinite scroll list)
    const [auditHistory, setAuditHistory] = useState<HistoryRecord[]>([])
    const [auditHistoryLoading, setAuditHistoryLoading] = useState(false)
    const [auditHistoryHasMore, setAuditHistoryHasMore] = useState(true)
    const [auditHistoryError, setAuditHistoryError] = useState('')
    const [auditTableFilter, setAuditTableFilter] = useState('all')
    const [auditAdminSearch, setAuditAdminSearch] = useState('')

    // "Add adoption pet" popup form state
    const [adoptionPetName, setAdoptionPetName] = useState('')
    const [adoptionPetAnimalType, setAdoptionPetAnimalType] = useState('other')
    const [adoptionPetImage, setAdoptionPetImage] = useState<File | null>(null)
    const [adoptionPetSubmitStatus, setAdoptionPetSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [adoptionPetSubmitMessage, setAdoptionPetSubmitMessage] = useState('')
    const [adoptionPets, setAdoptionPets] = useState<AdoptionPet[]>([])
    const [adoptionPetsLoading, setAdoptionPetsLoading] = useState(false)
    const [adoptionPetsError, setAdoptionPetsError] = useState('')
    const [deletingAdoptionPetId, setDeletingAdoptionPetId] = useState<number | string | null>(null)

    // "Appointments" popup state
    const [appointments, setAppointments] = useState<Schedule[]>([])
    const [appointmentsStatus, setAppointmentsStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [appointmentsError, setAppointmentsError] = useState('')

    // Refs for "Show services" popup pagination control
    const popupServicesOffsetRef = useRef(0)
    const popupServicesLoadingRef = useRef(false)
    const popupServicesHasMoreRef = useRef(true)
    const auditHistoryOffsetRef = useRef(0)
    const auditHistoryLoadingRef = useRef(false)
    const auditHistoryHasMoreRef = useRef(true)

    // Derived dashboard/chart data
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
                earnings: 0,
            }
        })

        const servicesCountByDay = servicesLast7Days.reduce<Record<string, { services: number; earnings: number }>>((acc, service) => {
            const ymd = new Date(service.created_at).toISOString().slice(0, 10)
            if (!acc[ymd]) {
                acc[ymd] = { services: 0, earnings: 0 }
            }
            acc[ymd].services += 1
            acc[ymd].earnings += service.earn ?? 0
            return acc
        }, {})

        return days.map((day) => ({
            day: day.day,
            services: servicesCountByDay[day.ymd]?.services ?? 0,
            earnings: servicesCountByDay[day.ymd]?.earnings ?? 0,
        }))
    }, [servicesLast7Days])

    const dashboardStats = useMemo(() => {
        const servicesLast7DaysCount = servicesLast7Days.length
        const earningsLast7Days = servicesLast7Days.reduce((sum, item) => sum + (item.earn ?? 0), 0)

        const servicesTodayList = services.filter((item) => {
            const createdAt = new Date(item.created_at)
            return (
                createdAt.getFullYear() === now.getFullYear() &&
                createdAt.getMonth() === now.getMonth() &&
                createdAt.getDate() === now.getDate()
            )
        })

        const servicesToday = servicesTodayList.length
        const earningsToday = servicesTodayList.reduce((sum, item) => sum + (item.earn ?? 0), 0)

        return {
            servicesLast7DaysCount,
            earningsLast7Days,
            servicesToday,
            earningsToday,
        }
    }, [servicesLast7Days, services, now])

    const sortedServices = useMemo(() => {
        return [...services].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }, [services])

    const sortedPopupServices = useMemo(() => {
        return [...popupServices].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }, [popupServices])

    const sortedAuditHistory = useMemo(() => {
        return [...auditHistory].sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
            return dateB - dateA
        })
    }, [auditHistory])

    const auditTableOptions = useMemo(() => {
        const uniqueTables = Array.from(
            new Set(
                auditHistory
                    .map((item) => item.on_table?.trim())
                    .filter((table): table is string => Boolean(table))
            )
        ).sort((a, b) => a.localeCompare(b))

        return ['all', ...uniqueTables]
    }, [auditHistory])

    const filteredAuditHistory = useMemo(() => {
        const normalizedAdminSearch = auditAdminSearch.trim().toLowerCase()

        return sortedAuditHistory.filter((item) => {
            const matchesTable =
                auditTableFilter === 'all' ||
                (item.on_table?.trim().toLowerCase() ?? '') === auditTableFilter.toLowerCase()

            const matchesAdmin =
                normalizedAdminSearch.length === 0 ||
                (item.admin?.toLowerCase() ?? '').includes(normalizedAdminSearch)

            return matchesTable && matchesAdmin
        })
    }, [sortedAuditHistory, auditTableFilter, auditAdminSearch])

    const currencyFormatter = useMemo(() => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        })
    }, [])

    const valueFormatter = (value: number | null, context?: { dataIndex?: number }) => {
        const servicesCount = value ?? 0
        const earningsAmount = typeof context?.dataIndex === 'number'
            ? chartData[context.dataIndex]?.earnings ?? 0
            : 0

        return `${servicesCount} services - ${currencyFormatter.format(earningsAmount)}`
    }

    function formatAdoptionPetType(type: string | null) {
        if (!type) {
            return 'Other'
        }

        return type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
    }

    const fetchPopupServicesPage = useCallback(async (reset = false) => {
        if (popupServicesLoadingRef.current) {
            return
        }

        if (!reset && !popupServicesHasMoreRef.current) {
            return
        }

        popupServicesLoadingRef.current = true
        setPopupServicesLoading(true)
        setPopupServicesError('')

        try {
            const offset = reset ? 0 : popupServicesOffsetRef.current
            const res = await fetch(`/api/db/getServices?limit=${SERVICES_PAGE_SIZE}&offset=${offset}`, {
                method: 'GET',
                credentials: 'include',
            })

            if (!res.ok) {
                throw new Error('Error services')
            }

            const data = await res.json() as RegisteredService[]
            const hasMore = data.length === SERVICES_PAGE_SIZE
            popupServicesHasMoreRef.current = hasMore
            setPopupServicesHasMore(hasMore)
            popupServicesOffsetRef.current = offset + data.length

            setPopupServices((prev) => {
                const base = reset ? [] : prev
                const ids = new Set(base.map((item) => item.id))
                const uniqueIncoming = data.filter((item) => {
                    if (ids.has(item.id)) {
                        return false
                    }
                    ids.add(item.id)
                    return true
                })

                return [...base, ...uniqueIncoming]
            })
        } catch (err) {
            setPopupServicesError('Could not load services.')
            console.log(err)
        } finally {
            popupServicesLoadingRef.current = false
            setPopupServicesLoading(false)
        }
    }, [])

    const fetchAuditHistoryPage = useCallback(async (reset = false) => {
        if (auditHistoryLoadingRef.current) {
            return
        }

        if (!reset && !auditHistoryHasMoreRef.current) {
            return
        }

        auditHistoryLoadingRef.current = true
        setAuditHistoryLoading(true)
        setAuditHistoryError('')

        try {
            const offset = reset ? 0 : auditHistoryOffsetRef.current
            const res = await fetch(`/api/db/getHistory?limit=${AUDIT_HISTORY_PAGE_SIZE}&offset=${offset}`, {
                method: 'GET',
                credentials: 'include',
            })

            if (!res.ok) {
                throw new Error('Error history')
            }

            const data = await res.json() as HistoryRecord[]
            const hasMore = data.length === AUDIT_HISTORY_PAGE_SIZE
            auditHistoryHasMoreRef.current = hasMore
            setAuditHistoryHasMore(hasMore)
            auditHistoryOffsetRef.current = offset + data.length

            setAuditHistory((prev) => {
                const base = reset ? [] : prev
                const ids = new Set(base.map((item) => String(item.id)))
                const uniqueIncoming = data.filter((item) => {
                    const itemId = String(item.id)
                    if (ids.has(itemId)) {
                        return false
                    }
                    ids.add(itemId)
                    return true
                })

                return [...base, ...uniqueIncoming]
            })
        } catch (err) {
            setAuditHistoryError('Could not load audit history.')
            console.log(err)
        } finally {
            auditHistoryLoadingRef.current = false
            setAuditHistoryLoading(false)
        }
    }, [])

    function handlePopupServicesScroll(e: UIEvent<HTMLDivElement>) {
        const element = e.currentTarget
        const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 24

        if (nearBottom) {
            void fetchPopupServicesPage(false)
        }
    }

    function handleAuditHistoryScroll(e: UIEvent<HTMLDivElement>) {
        const element = e.currentTarget
        const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 24

        if (nearBottom) {
            void fetchAuditHistoryPage(false)
        }
    }

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

                const data = await res.json() as RegisteredService[]
                const uniqueServices = data.filter((item, index, array) =>
                    index === array.findIndex((current) => current.id === item.id)
                )
                setServices(uniqueServices)
            } catch (err) {
                console.log(err)
            }
        }
        getServices()

        async function preloadAppointments() {
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
            } catch (err) {
                console.log(err)
            }
        }
        preloadAppointments()
    }, [])

    const fetchAdoptionPets = useCallback(async () => {
        setAdoptionPetsLoading(true)
        setAdoptionPetsError('')

        try {
            const res = await fetch('/api/db/getAdoptionPets', {
                method: 'GET',
                credentials: 'include',
            })

            if (!res.ok) {
                throw new Error('Could not load adoption pets')
            }

            const data = await res.json() as AdoptionPet[]
            setAdoptionPets(Array.isArray(data) ? data : [])
        } catch (err) {
            setAdoptionPets([])
            setAdoptionPetsError('Could not load adoption pets.')
            console.log(err)
        } finally {
            setAdoptionPetsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (popup === 'addAdoptionPet') {
            void fetchAdoptionPets()
        }
    }, [popup, fetchAdoptionPets])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60000)

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

    async function handleAdoptionPetSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (adoptionPetSubmitStatus === 'loading') {
            return
        }

        setAdoptionPetSubmitStatus('loading')
        setAdoptionPetSubmitMessage('Saving adoption pet...')

        try {
            const formData = new FormData()
            formData.append('name', adoptionPetName.trim())
            formData.append('pet_type', adoptionPetAnimalType)
            if (adoptionPetImage) {
                formData.append('image', adoptionPetImage)
            }

            const res = await fetch('/api/db/postAdoptionPet', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            })

            if (!res.ok) {
                const data = await res.json().catch(() => null)
                throw new Error(data?.error ?? 'Could not save adoption pet.')
            }

            setAdoptionPetSubmitStatus('success')
            setAdoptionPetSubmitMessage('Adoption pet saved successfully.')
            setAdoptionPetName('')
            setAdoptionPetAnimalType('other')
            setAdoptionPetImage(null)
            await fetchAdoptionPets()

            setTimeout(() => {
                setAdoptionPetSubmitStatus('idle')
                setAdoptionPetSubmitMessage('')
            }, 1500)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Could not save adoption pet.'
            setAdoptionPetSubmitStatus('error')
            setAdoptionPetSubmitMessage(message)
        }
    }

    async function handleDeleteAdoptionPet(adoptionPetId: number | string) {
        if (deletingAdoptionPetId !== null) {
            return
        }

        setDeletingAdoptionPetId(adoptionPetId)

        try {
            const res = await fetch('/api/db/deleteAdoptionPet', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adoptionPetId }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => null)
                throw new Error(data?.error ?? 'Could not delete adoption pet.')
            }

            setAdoptionPets((prev) => prev.filter((pet) => String(pet.id) !== String(adoptionPetId)))
            setAdoptionPetSubmitStatus('success')
            setAdoptionPetSubmitMessage('Adoption pet deleted successfully.')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Could not delete adoption pet.'
            setAdoptionPetSubmitStatus('error')
            setAdoptionPetSubmitMessage(message)
        } finally {
            setDeletingAdoptionPetId(null)
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

    function handleOpenAuditHistoryPopup() {
        setAuditTableFilter('all')
        setAuditAdminSearch('')
        setPopup('auditHistory')
        void fetchAuditHistoryPage(true)
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

        const totalMinutes = Math.floor(milliseconds / 60000)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60

        return `${hours}h ${minutes}m`
    }

    return (
        <>
            <div className="w-[95%] lg:w-[80%] mx-auto">

                <div className="w-full mb-10 mt-10 flex flex-col gap-4 lg:flex-row lg:items-center">
                    <h2 className="text-lg md:text-2xl text-neutral-800 lg:flex-1">Admin dashboard</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
                        <SpotlightCard className="p-4 w-full lg:min-w-[45]">
                            <h3 className="text-sm text-neutral-600">Services last 7 days</h3>
                            <p className="text-2xl font-bold text-neutral-900">{dashboardStats.servicesLast7DaysCount}</p>
                        </SpotlightCard>
                        <SpotlightCard className="p-4 w-full lg:min-w-[45]">
                            <h3 className="text-sm text-neutral-600">Earnings last 7 days</h3>
                            <p className="text-2xl font-bold text-neutral-900">{currencyFormatter.format(dashboardStats.earningsLast7Days)}</p>
                        </SpotlightCard>
                        <SpotlightCard className="p-4 w-full lg:min-w-[45]">
                            <h3 className="text-sm text-neutral-600">Services today</h3>
                            <p className="text-2xl font-bold text-neutral-900">{dashboardStats.servicesToday}</p>
                        </SpotlightCard>
                        <SpotlightCard className="p-4 w-full lg:min-w-[45]">
                            <h3 className="text-sm text-neutral-600">Earnings today</h3>
                            <p className="text-2xl font-bold text-neutral-900">{currencyFormatter.format(dashboardStats.earningsToday)}</p>
                        </SpotlightCard>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:grid-rows-6">

                    {/* Buttons */}
                    <div className="order-2 lg:order-1 col-span-1 lg:col-span-2 lg:row-span-3 w-full lg:w-[90%] mx-auto flex flex-col gap-2 md:text-xl text-dm">

                        {/* Register service button */}
                        <button
                            type="button"
                            className="bg-neutral-100 border border-neutral-300 rounded-lg hover:cursor-pointer flex gap-4 px-6 p-3 w-full"
                            onClick={() => {
                                setPopup('registerService')
                                setSubmitStatus('idle')
                                setSubmitMessage('')
                            }}
                        >
                            <div className="w-16 h-16 bg-blue-500 rounded-lg relative flex items-center justify-center">
                                <Image src={'/icons/admin-panel/add-icon.svg'}
                                    alt="Register service icon"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <p className="text-neutral-800 semibold self-center">Register service</p>
                        </button>

                        {/* Appointments button */}
                        <button
                            type="button"
                            onClick={handleOpenAppointmentsPopup}
                            className="bg-neutral-100 border border-neutral-300 rounded-lg hover:cursor-pointer flex gap-4 px-6 p-3 w-full"
                        >
                            <div className="w-16 h-16 bg-red-500 rounded-lg relative flex items-center justify-center">
                                {todayAppointments.length > 0 && (
                                    <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_0_4px_rgba(239,68,68,0.2)]" />
                                )}
                                <Image src={'/icons/admin-panel/appointments-icon.svg'}
                                    alt="Register service icon"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <p className="text-neutral-800 semibold self-center">Appointments</p>
                        </button>

                        {/* Adoption pet management button */}
                        <button
                            type="button"
                            className="bg-neutral-100 border border-neutral-300 rounded-lg hover:cursor-pointer flex gap-4 px-6 p-3 w-full"
                            onClick={() => {
                                setPopup('addAdoptionPet')
                                setAdoptionPetSubmitStatus('idle')
                                setAdoptionPetSubmitMessage('')
                                void fetchAdoptionPets()
                            }}
                        >
                            <div className="w-16 h-16 bg-green-600 rounded-lg relative flex items-center justify-center">
                                <Image src={'/icons/admin-panel/pet-adoption-icon.svg'}
                                    alt="Register service icon"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <p className="text-neutral-800 semibold self-center">Adoption pets management</p>
                        </button>

                        {/* Audit button */}
                        <button
                            type="button"
                            onClick={handleOpenAuditHistoryPopup}
                            className="bg-neutral-100 border border-neutral-300 rounded-lg hover:cursor-pointer flex gap-4 px-6 p-3 w-full"
                        >
                            <div className="w-16 h-16 bg-black rounded-lg relative flex items-center justify-center">
                                <Image src={'/icons/admin-panel/audit-icon.svg'}
                                    alt="Register service icon"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <p className="text-neutral-800 semibold self-center">Audit</p>
                        </button>

                    </div>

                    {/* Bar chart */}
                    <div className="order-1 lg:order-2 col-span-1 lg:col-span-3 lg:row-span-3 lg:col-start-3 lg:row-start-1 h-80">
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
                    <div className="order-3 lg:order-0 col-span-1 lg:col-span-5 lg:row-span-3 lg:col-start-1 lg:row-start-4 bg-white border border-neutral-300 rounded-xl p-4 h-full">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-neutral-900">Registered services</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setPopup('showServices')
                                    void fetchPopupServicesPage(true)
                                }}
                                className="text-white bg-black rounded-md px-3 py-1 border border-neutral-700 cursor-pointer text-sm"
                            >
                                Show list
                            </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 border-b border-neutral-200">
                            <p>Pet ID</p>
                            <p>Pet type</p>
                            <p>Date</p>
                            <p>Service</p>
                            <p className="text-right">Earn</p>
                        </div>

                        {sortedServices.length === 0 ? (
                            <p className="text-neutral-500 py-6 text-center">No services registered yet.</p>
                        ) : (
                            <div className="max-h-58 overflow-y-auto">
                                {sortedServices.map((serviceItem) => (
                                    <div
                                        key={`service-panel-${serviceItem.id}-${serviceItem.created_at}`}
                                        className="grid grid-cols-2 lg:grid-cols-5 gap-2 px-3 py-3 border-b border-neutral-100 text-sm text-neutral-800"
                                    >
                                        <p>
                                            {serviceItem.pet_id !== null && serviceItem.pet_id !== undefined
                                                ? `#${serviceItem.pet_id}`
                                                : 'N/A'}
                                        </p>
                                        <p className="capitalize">{serviceItem.animal_type}</p>
                                        <p>
                                            {new Intl.DateTimeFormat('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                            }).format(new Date(serviceItem.created_at))}
                                        </p>
                                        <p className="capitalize">{serviceItem.service}</p>
                                        <p className="text-right font-semibold">{currencyFormatter.format(serviceItem.earn ?? 0)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/*Register service popup */}
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

            {/* Appointments schedule popup */}
            {popup === 'appointments' && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white border border-neutral-500 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-black">Appointments schedule</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setPopup('')
                                    setAdoptionPetSubmitStatus('idle')
                                    setAdoptionPetSubmitMessage('')
                                }}
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
                                <div className="bg-white border border-neutral-300 rounded-lg p-4 mb-4">
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
                                                    className="border border-neutral-300 rounded-lg p-3 bg-white text-black border-l-4 border-l-red-500"
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

            {/* Services list popup */}
            {popup === 'showServices' && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl bg-white border border-neutral-500 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-black">Registered services</h3>
                            <button
                                type="button"
                                onClick={() => setPopup('')}
                                className="text-white bg-black rounded-md px-3 py-1 border border-red-500 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 border-b border-neutral-200">
                            <p>Pet ID</p>
                            <p>Pet type</p>
                            <p>Date</p>
                            <p>Service</p>
                            <p className="text-right">Earn</p>
                        </div>

                        {sortedPopupServices.length === 0 ? (
                            popupServicesLoading ? (
                                <p className="text-neutral-500 py-6 text-center">Loading services...</p>
                            ) : (
                                <p className="text-neutral-500 py-6 text-center">No services registered yet.</p>
                            )
                        ) : (
                            <div className="max-h-[60vh] overflow-y-auto" onScroll={handlePopupServicesScroll}>
                                {sortedPopupServices.map((serviceItem) => (
                                    <div
                                        key={`service-popup-${serviceItem.id}-${serviceItem.created_at}`}
                                        className="grid grid-cols-2 lg:grid-cols-5 gap-2 px-3 py-3 border-b border-neutral-100 text-sm text-neutral-800"
                                    >
                                        <p>
                                            {serviceItem.pet_id !== null && serviceItem.pet_id !== undefined
                                                ? `#${serviceItem.pet_id}`
                                                : 'N/A'}
                                        </p>
                                        <p className="capitalize">{serviceItem.animal_type}</p>
                                        <p>
                                            {new Intl.DateTimeFormat('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                            }).format(new Date(serviceItem.created_at))}
                                        </p>
                                        <p className="capitalize">{serviceItem.service}</p>
                                        <p className="text-right font-semibold">{currencyFormatter.format(serviceItem.earn ?? 0)}</p>
                                    </div>
                                ))}
                                {popupServicesLoading && (
                                    <p className="text-center text-xs text-neutral-500 py-3">Loading more services...</p>
                                )}
                                {!popupServicesHasMore && (
                                    <p className="text-center text-xs text-neutral-500 py-3">End of list.</p>
                                )}
                                {popupServicesError && (
                                    <p className="text-center text-xs text-red-600 py-3">{popupServicesError}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Audit history popup */}
            {popup === 'auditHistory' && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-5xl bg-white border border-neutral-500 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-black">Audit history</h3>
                            <button
                                type="button"
                                onClick={() => setPopup('')}
                                className="text-white bg-black rounded-md px-3 py-1 border border-red-500 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="audit-table-filter" className="text-xs font-semibold text-neutral-600">
                                    Filter by table
                                </label>
                                <select
                                    id="audit-table-filter"
                                    value={auditTableFilter}
                                    onChange={(e) => setAuditTableFilter(e.target.value)}
                                    className="border border-neutral-300 rounded-md px-3 py-2 text-sm text-neutral-800"
                                >
                                    {auditTableOptions.map((table) => (
                                        <option key={table} value={table}>
                                            {table === 'all' ? 'All tables' : table}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="audit-admin-search" className="text-xs font-semibold text-neutral-600">
                                    Search admin
                                </label>
                                <input
                                    id="audit-admin-search"
                                    type="text"
                                    value={auditAdminSearch}
                                    onChange={(e) => setAuditAdminSearch(e.target.value)}
                                    placeholder="Type an admin name"
                                    className="border border-neutral-300 rounded-md px-3 py-2 text-sm text-neutral-800"
                                />
                            </div>
                        </div>

                        <div className="hidden lg:grid lg:grid-cols-4 gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 border-b border-neutral-200">
                            <p>Admin</p>
                            <p>Table</p>
                            <p>Details</p>
                            <p>Date</p>
                        </div>

                        {sortedAuditHistory.length === 0 ? (
                            auditHistoryLoading ? (
                                <p className="text-neutral-500 py-6 text-center">Loading audit history...</p>
                            ) : auditHistoryError ? (
                                <p className="text-red-600 py-6 text-center">{auditHistoryError}</p>
                            ) : (
                                <p className="text-neutral-500 py-6 text-center">No audit records yet.</p>
                            )
                        ) : filteredAuditHistory.length === 0 ? (
                            <p className="text-neutral-500 py-6 text-center">No records match the current filters.</p>
                        ) : (
                            <div className="max-h-[60vh] overflow-y-auto" onScroll={handleAuditHistoryScroll}>
                                {filteredAuditHistory.map((historyItem) => (
                                    <div
                                        key={`history-popup-${historyItem.id}-${historyItem.created_at ?? 'no-date'}`}
                                        className="grid grid-cols-1 lg:grid-cols-4 gap-2 px-3 py-3 border-b border-neutral-100 text-sm text-neutral-800"
                                    >
                                        <p><span className="lg:hidden font-semibold">Admin: </span>{historyItem.admin ?? 'N/A'}</p>
                                        <p><span className="lg:hidden font-semibold">Table: </span>{historyItem.on_table ?? 'N/A'}</p>
                                        <p><span className="lg:hidden font-semibold">Details: </span>{historyItem.details ?? 'N/A'}</p>
                                        <p>
                                            <span className="lg:hidden font-semibold">Date: </span>
                                            {historyItem.created_at
                                                ? new Intl.DateTimeFormat('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                }).format(new Date(historyItem.created_at))
                                                : 'N/A'}
                                        </p>
                                    </div>
                                ))}
                                {auditHistoryLoading && (
                                    <p className="text-center text-xs text-neutral-500 py-3">Loading more records...</p>
                                )}
                                {!auditHistoryHasMore && (
                                    <p className="text-center text-xs text-neutral-500 py-3">End of list.</p>
                                )}
                                {auditHistoryError && (
                                    <p className="text-center text-xs text-red-600 py-3">{auditHistoryError}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/*adoption pet management popup */}
            {popup === 'addAdoptionPet' && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-5xl bg-white border border-neutral-300 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-black">Adoption pets management</h3>
                            <button
                                type="button"
                                onClick={() => setPopup('')}
                                className="text-white bg-black rounded-md px-3 py-1 border border-red-500 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-130 max-h-140">
                            <form onSubmit={handleAdoptionPetSubmit} className="border border-neutral-200 rounded-lg p-4 flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="adoptionPetImage" className="text-sm text-neutral-700">Photo (JPG)</label>
                                    <div className="flex items-center gap-3">
                                        <label
                                            htmlFor="adoptionPetImage"
                                            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neutral-100 text-neutral-800 cursor-pointer border border-neutral-300"
                                        >
                                            Choose image
                                        </label>
                                        <p className="text-sm text-neutral-500">
                                            {adoptionPetImage ? adoptionPetImage.name : 'No file selected'}
                                        </p>
                                    </div>
                                    <input
                                        id="adoptionPetImage"
                                        type="file"
                                        accept=".jpg,.jpeg,image/jpeg"
                                        onChange={(e) => setAdoptionPetImage(e.target.files?.[0] ?? null)}
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="adoptionPetName" className="text-sm text-neutral-700">Name</label>
                                    <input
                                        id="adoptionPetName"
                                        type="text"
                                        required
                                        value={adoptionPetName}
                                        onChange={(e) => setAdoptionPetName(e.target.value)}
                                        className="p-2 rounded-lg border border-neutral-300"
                                        placeholder="Pet name"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="adoptionPetAnimalType" className="text-sm text-neutral-700">Animal type</label>
                                    <select
                                        id="adoptionPetAnimalType"
                                        value={adoptionPetAnimalType}
                                        onChange={(e) => setAdoptionPetAnimalType(e.target.value)}
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

                                <div className="flex gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPopup('')
                                            setAdoptionPetSubmitStatus('idle')
                                            setAdoptionPetSubmitMessage('')
                                        }}
                                        className="w-full p-2 rounded-lg bg-neutral-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={adoptionPetSubmitStatus === 'loading'}
                                        className="w-full p-2 rounded-lg bg-black text-white disabled:opacity-60"
                                    >
                                        Save
                                    </button>
                                </div>
                                {adoptionPetSubmitStatus !== 'idle' && (
                                    <p className={`text-sm ${adoptionPetSubmitStatus === 'error' ? 'text-red-600' : 'text-neutral-700'}`}>
                                        {adoptionPetSubmitMessage}
                                    </p>
                                )}
                            </form>

                            <div className="border border-neutral-200 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Adoption pets list</h4>
                                {adoptionPetsLoading ? (
                                    <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-neutral-500">
                                        Loading adoption pets...
                                    </div>
                                ) : adoptionPetsError ? (
                                    <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-red-600">
                                        {adoptionPetsError}
                                    </div>
                                ) : adoptionPets.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-neutral-500">
                                        No adoption pets registered yet.
                                    </div>
                                ) : (
                                    <div className="max-h-110 overflow-y-auto pr-1 space-y-2">
                                        {adoptionPets.map((pet) => {
                                            const hasPetImage = typeof pet.image === 'string' && pet.image.trim().length > 0
                                            const petImageSrc = hasPetImage && pet.image ? pet.image : '/images/adoptions/cat-box.png'

                                            return (
                                                <div key={`adoption-pet-${pet.id}`} className="border border-neutral-200 rounded-lg p-3 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="relative w-14 h-14 rounded-md overflow-hidden bg-neutral-100 shrink-0">
                                                            <Image
                                                                src={petImageSrc}
                                                                alt={pet.name}
                                                                fill
                                                                unoptimized
                                                                className={hasPetImage ? 'object-cover' : 'object-contain p-1'}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-neutral-900 truncate">{pet.name}</p>
                                                            <p className="text-sm text-neutral-600">{formatAdoptionPetType(pet.pet_type)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleDeleteAdoptionPet(pet.id)}
                                                        disabled={deletingAdoptionPetId === pet.id}
                                                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-60 hover:cursor-pointer"
                                                    >
                                                        {deletingAdoptionPetId === pet.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}
