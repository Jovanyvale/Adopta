import PetCard from "../PetCard"
import type { Pet } from "@/app/types/pet"
import { RegisteredService } from "@/app/types/registeredServices"


type PetWithServices = Pet & {
    services: RegisteredService[]
}
type PetPopUpType = {
    petsWithServices: PetWithServices[]
    onClose: () => void
    onSelectPet: (petId: number) => void
}
export default function PetsPopUp({ petsWithServices, onClose, onSelectPet }: PetPopUpType) {
    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 flex-col">

                <div className="w-[90%] max-w-260 md:p-8 p-2 bg-white rounded-xl overflow-y-auto grid md:grid-cols-3 grid-cols-1 md:gap-4 gap-2 max-h-200">

                    {petsWithServices.map((pet) => (
                        <PetCard
                            key={pet.id}
                            petId={pet.id}
                            petName={pet.name}
                            petType={pet.type}
                            lastService={pet.services.length < 1 ? 'No services yet' : pet.services[1].service}
                            lastServiceDate={pet.services.length < 1 ? '' : pet.last_treatment}
                            editPet={onSelectPet}
                        />
                    ))}

                </div>

                <button className="bg-neutral-200 p-3 rounded-full mt-6 mx-auto hover:cursor-pointer w-80 text-xl mb-4"
                    onClick={onClose}>
                    Close
                </button>

            </div>
        </>
    )
}