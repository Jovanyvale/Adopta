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
                setError(error)
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
                < PetInfoPopUp
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

            {/* Page content */}
            <div className="w-[90%] mx-auto mt-12 
                flex flex-col gap-4
                lg:grid lg:grid-cols-5 lg:grid-rows-5 lg:gap-4">

                {/* Title */}
                <div className="bg-blue-200 rounded-2xl flex items-center justify-center p-4
                    lg:col-span-4 lg:justify-items-center lg:place-content-center">
                    <p className="lg:text-3xl">My pets</p>
                </div>

                {/* Schedule div */}
                <div className="bg-neutral-100 rounded-2xl p-4
                    lg:row-span-3 lg:col-start-5 lg:row-start-1">
                    <SpotlightCard className="col-span-3 row-span-4 row-start-3 flex flex-col gap-2 items-center justify-center bg-neutral-100 h-full border-0">
                        <p>Next appointment</p>
                        <p className="bg-red-500 text-white p-3 rounded-md text-center text-sm">
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
                            < p className="truncate text-white text-center p-2 bg-neutral-700 rounded-md text-sm">
                                Pet: ${nextAppointmentPetName ?? 'Unknown pet'}
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

                {/* See all pets button */}
                <div className="lg:row-span-2 lg:col-start-5 lg:row-start-4">
                    <button className="h-full w-full flex items-center justify-center flex-col p-6 
                           bg-neutral-100 rounded-2xl border border-neutral-300
                           hover:cursor-pointer text-lg hover:bg-amber-100 duration-550"
                        onClick={() => setPopup('pets')}>
                        See your pets
                    </button>
                </div>

                {/* Pets div */}
                <div className="grid grid-cols-1 gap-4 justify-items-center
                    lg:col-span-4 lg:row-span-4 lg:col-start-1 md:mb-0 mb-10 lg:row-start-2
                    lg:grid-cols-4">
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

                    <div
                        className="flex items-center justify-center flex-col p-6 w-full h-full
                       bg-neutral-100 rounded-2xl border border-neutral-300
                       hover:cursor-pointer"
                        onClick={() => setPopup('addPet')}
                    >

                        <p className="text-3xl ">+</p>
                        <p className="text-xl p-2 bg-blue-300 rounded-full">Add a pet</p>
                    </div>
                </div>
            </div >
        </>
    )
}
