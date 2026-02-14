import Image from "next/image"

type PetCardProps = {
    petId: number,
    petName: string,
    petType: string,
    lastService: string,
    lastServiceDate: string,
    editPet: (petId: number) => void
}
export default function PetCard({ petId, petName, petType, lastService, lastServiceDate, editPet }: PetCardProps) {

    return (
        <div className="w-full bg-neutral-100 border border-neutral-300 rounded-2xl md:p-6 p-3 flex md:flex-col gap-4 hover:shadow-md transition-shadow duration-200">

            {/* Container */}
            <div >
                {/* Icon container */}
                <div className="relative h-22 md:w-full w-22 flex items-center justify-center bg-white rounded-xl border border-neutral-300">
                    <div className="relative md:h-16 md:w-16 w-10 h-10">
                        <Image
                            src={`/icons/control-panel/pets/${petType}-pet-icon.svg`}
                            fill
                            alt={petName + ' icon'}
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Name */}
                <div className="flex flex-col items-center gap-1 mt-2">
                    <p className="md:text-lg text-xs font-semibold px-2 py-1 rounded-full bg-blue-300 text-neutral-900 truncate max-w-18">
                        {petName.charAt(0).toUpperCase() + petName.slice(1)}
                    </p>
                    <p className="text-sm text-neutral-600 capitalize">
                        {petType}
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="md:h-px w-px bg-neutral-300 md:w-full h-full" />

            {/* Container */}
            <div className="flex flex-col justify-between">
                {/* Last service section */}
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-neutral-700 tracking-wide">
                        Last service
                    </p>

                    <div className="bg-white border border-neutral-300 rounded-lg p-3 flex flex-col text-sm">
                        <p className="font-medium text-neutral-900 capitalize">
                            {lastService}
                        </p>
                        <p className="text-sm text-neutral-600">
                            {lastServiceDate || '—'}
                        </p>
                    </div>
                </div>

                <button className="p-2 rounded-md bg-black w-full text-center text-white md:mt-3 hover:cursor-pointer"
                    onClick={() => editPet(petId)}>
                    View
                </button>
            </div>
        </div>
    )
}