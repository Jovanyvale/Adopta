'use client'
import { useEffect, useState } from "react"
import type { RegisteredService } from "@/app/types/registeredServices"
import type { Profile } from "@/app/types/profile"
import type { Pet } from "@/app/types/pet"
import type { Schedule } from "@/app/types/schedule"
import { useMemo } from "react"
import PetCard from "@/app/components/PetCard"
import PetInfoPopUp from "@/app/components/popups/PetCreationPopUp"
import PetsPopUp from "@/app/components/popups/PetsPopUp"
import PetEditPopUp from "@/app/components/popups/PetEditPopUp"
import SpotlightCard from "@/app/components/SpotlightCard"

type PetWithServices = Pet & {
    services: RegisteredService[]
}

export default function Profile() {

    const [services, setServices] = useState<RegisteredService[]>([])
    const [editingPet, setEditingPet] = useState<number | null>(null)
    const [pets, setPets] = useState<Pet[]>([])
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [user, setUser] = useState<Profile>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [popup, setPopup] = useState('')
    const [deletingAppointment, setDeletingAppointment] = useState(false)
    const [appointmentActionMessage, setAppointmentActionMessage] = useState('')

    const nowDate = new Date();

    useEffect(() => {
        async function getUser() {
            try {
                const res = await fetch('/api/db', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    throw new Error('Error getting user data')
                }
                const data = await res.json()
                setPets(data.pets)
                setUser(data.profile)
                setLoading(false)

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unexpected error')
            }

        }
        getUser()

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

                //Order the schedules and filter passed ones
                const orderedServices = data.sort((a: RegisteredService, b: RegisteredService) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )

                setServices(orderedServices)
            } catch (err) {
                console.log(err)
            }
        }
        getServices();

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

    }, [])

    //Reagroup all services with the same 'pet_id'
    const servicesByPet = useMemo(() => {
        return services.reduce<Record<number, RegisteredService[]>>(
            (acc, service) => {
                if (!acc[service.pet_id]) {
                    acc[service.pet_id] = []
                }
                acc[service.pet_id].push(service)
                return acc
            },
            {}
        )
    }, [services])

    //Unified pets info with pets services
    const petsWithServices: PetWithServices[] = pets.map(pet => ({
        ...pet,
        services: servicesByPet[pet.id] ?? []
    }))

    const selectedPet = petsWithServices.find(
        (pet) => pet.id === editingPet
    )
    const nextAppointmentPetName = schedules.length > 0
        ? pets.find((pet) => pet.id === schedules[0].pet_id)?.name
        : null

    async function handleDeleteAppointment() {
        if (schedules.length < 1) {
            return
        }

        const nextSchedule = schedules[0]
        setDeletingAppointment(true)
        setAppointmentActionMessage('')

        try {
            const res = await fetch('/api/db/deleteSchedule', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    petId: nextSchedule.pet_id,
                    scheduleId: nextSchedule.id
                })
            })

            if (!res.ok) {
                throw new Error('Error deleting appointment')
            }

            setSchedules((prev) => prev.filter((schedule) => schedule.id !== nextSchedule.id))
            setAppointmentActionMessage('Appointment deleted.')
        } catch (err) {
            setAppointmentActionMessage('Could not delete appointment.')
        } finally {
            setDeletingAppointment(false)
        }
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
        <>
            {/* PopUps management */}
            {popup == 'addPet' &&
                <PetInfoPopUp
                    onClose={() => setPopup('')}
                />
            }

            {popup == 'pets' &&
                <PetsPopUp
                    petsWithServices={petsWithServices}
                    onClose={() => setPopup('')}
                    onSelectPet={(petId) => {
                        setEditingPet(petId)
                        setPopup('petEdit')
                    }
                    }
                />
            }

            {popup == 'petEdit' && editingPet !== null &&
                <PetEditPopUp
                    petId={editingPet}
                    petName={selectedPet?.name ?? ''}
                    petType={selectedPet?.type ?? ''}
                    services={selectedPet?.services ?? []}
                    schedules={schedules.filter(schedule => schedule.pet_id === editingPet)}
                    onClose={() => setPopup('')}
                />
            }

            <div className="w-[92%] mx-auto mt-10 md:mt-14 flex flex-col gap-6">
                <div className="relative overflow-hidden rounded-3xl border border-neutral-200 p-6 md:p-10">
                    <div className="relative z-10 flex flex-col gap-2 items-center text-center">
                        <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">Control center</p>
                        <h1 className="text-3xl md:text-5xl">My pets</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                className="h-full w-full flex items-center justify-center flex-col gap-1 p-6 bg-white rounded-2xl border border-neutral-200 hover:cursor-pointer hover:bg-amber-50 transition-colors"
                                onClick={() => setPopup('pets')}
                            >
                                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Overview</p>
                                <p className="text-lg">See your pets</p>
                            </button>

                            <button
                                className="h-full w-full flex items-center justify-center flex-col gap-1 p-6 bg-white rounded-2xl border border-neutral-200 hover:cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => setPopup('addPet')}
                            >
                                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Quick add</p>
                                <p className="text-lg">Add a pet</p>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {petsWithServices.slice(0, 3).map((pet) => (
                                <PetCard
                                    key={pet.id}
                                    petId={pet.id}
                                    petName={pet.name}
                                    petType={pet.type}
                                    lastService={
                                        pet.services.length < 1
                                            ? 'No services yet'
                                            : pet.services[0].service
                                    }
                                    lastServiceDate={
                                        pet.services.length < 1
                                            ? ''
                                            : pet.last_treatment
                                    }
                                    editPet={(petId) => {
                                        setEditingPet(petId)
                                        setPopup('petEdit')
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <SpotlightCard className="h-full flex flex-col gap-4 bg-white border border-neutral-200 p-6">
                            <div className="flex items-center justify-between">
                                <p className="text-neutral-600 text-sm uppercase tracking-[0.25em]">Next appointment</p>
                                <span className="text-xs bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1">
                                    {schedules.length} upcoming
                                </span>
                            </div>
                            <p className="bg-red-500 text-white p-3 rounded-md text-center text-sm md:text-base">
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
                            {schedules.length > 0 &&
                                <p className="truncate text-white text-center p-2 bg-neutral-700 rounded-md text-sm">
                                    Pet: {nextAppointmentPetName ?? 'Unknown pet'}
                                </p>
                            }

                            {schedules.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleDeleteAppointment}
                                    disabled={deletingAppointment}
                                    className="p-3 text-sm bg-red-600 rounded-2xl text-white hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {deletingAppointment ? 'Deleting...' : 'Delete next appointment'}
                                </button>
                            )}
                            {appointmentActionMessage && (
                                <p className="text-xs text-center text-neutral-700">{appointmentActionMessage}</p>
                            )}
                        </SpotlightCard>
                    </div>
                </div>
            </div>
        </>
    )
}
