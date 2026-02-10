import Image from "next/image"

type PetCardProps = {
    petName: string,
    petType: string,
    lastService: string,
    lastServiceDate: string
}
export default function PetCard({ petName, petType, lastService, lastServiceDate }: PetCardProps) {
    return (
        <div className="w-[90%] md:w-full bg-neutral-100 border border-neutral-300 rounded-2xl p-6 gap-1 flex flex-col">
            <div className="w-[90%] relative h-30">
                <Image src={`/icons/control-panel/pets/${petType}-pet-icon.svg`}
                    fill
                    alt={petName + 'icon'}
                    className="object-contain"
                />
            </div>
            <p className="text-lg p-2 rounded-full bg-neutral-300 text-center">{petName.charAt(0).toUpperCase() + petName.slice(1)}</p>
            <p className="text-md text-neutral-700">{petType.charAt(0).toUpperCase() + petType.slice(1)}</p>
            <p>Last service</p>
            <div className="flex flex-col bg-neutral-300 p-1 rounded-md ">
                <p>{lastService.charAt(0).toUpperCase() + lastService.slice(1)}</p>
                <p className="text-neutral-700">{lastServiceDate}</p>
            </div>
        </div>
    )
}