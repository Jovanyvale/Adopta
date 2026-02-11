'use client'
import { useEffect, useState } from "react"
import type { RegisteredService } from "@/app/types/registeredServices"
import type { Profile } from "@/app/types/profile"
import type { Pet } from "@/app/types/pet"
import { useMemo } from "react"
import PetCard from "@/app/components/PetCard"
import PetInfoPopUp from "@/app/components/popups/PetCreationPopUp"

type PetWithServices = Pet & {
    services: RegisteredService[]
}

export default function Profile() {

    const [services, setServices] = useState<RegisteredService[]>([])
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

    return (
        <>
            {popup == 'addPet' &&
                <PetInfoPopUp
                    onSuccess={() => console.log('h')}
                    onClose={() => setPopup('')}
                />
            }
            <div className="grid grid-cols-5 grid-rows-5 gap-4 w-[90%] mx-auto my-auto">

                {/* Title */}
                <div className="col-span-4 bg-blue-200 justify-items-center place-content-center rounded-2xl">
                    <p className="text-3xl">My pets</p>
                </div>

                {/* Services div */}
                <div className="row-span-3 col-start-5 row-start-1">3</div>

                {/* See all pets button */}
                <div className="row-span-2 col-start-5 row-start-4">4</div>

                {/* Pets div */}
                <div className="col-span-4 row-span-4 col-start-1 row-start-2 grid grid-cols-4 gap-4">
                    {petsWithServices.slice(0, 3).map((pet) => (
                        <PetCard
                            key={pet.id}
                            petName={pet.name}
                            petType={pet.type}
                            lastService={pet.services.length <= 0 ? 'No services yet' : pet.services[1].service}
                            lastServiceDate={pet.services.length <= 0 ? '' : pet.last_treatment}
                        />
                    )
                    )}
                    <div className="flex items-center justify-center flex-col p-6 bg-neutral-100 rounded-2xl border border-neutral-300
                    hover:cursor-pointer"
                        onClick={() => setPopup('addPet')}>
                        <p className="text-6xl">+</p>
                        <p className="text-xl">Add a pet</p>
                    </div>
                </div>
            </div>
        </>
    )
}