'use client'
import { useEffect, useState } from "react"
import type { RegisteredService } from "@/app/types/registeredServices"
import type { Profile } from "@/app/types/profile"
import type { Pet } from "@/app/types/pet"
import { useMemo } from "react"
import PetCard from "@/app/components/PetCard"
import PetInfoPopUp from "@/app/components/popups/PetCreationPopUp"
import PetsPopUp from "@/app/components/popups/PetsPopUp"

type PetWithServices = Pet & {
    services: RegisteredService[]
}

export default function Profile() {

    const [services, setServices] = useState<RegisteredService[]>([])
    const [editingPet, setEditingPet] = useState<number | null>(null)
    const [pets, setPets] = useState<Pet[]>([])
    const [user, setUser] = useState<Profile>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [popup, setPopup] = useState('')

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

    setTimeout(() => { console.log(petsWithServices) }, 2000)

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
                        setPopup('')
                        setEditingPet(petId)
                    }
                    }
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

                {/* Services div */}
                <div className="bg-neutral-100 rounded-2xl p-4
                    lg:row-span-3 lg:col-start-5 lg:row-start-1">
                    3
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
                                setPopup('')
                                setEditingPet(petId)
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
            </div>
        </>
    )
}