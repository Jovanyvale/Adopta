import Image from "next/image"

type PetCardProps = {
    petName: string,
    petType: string,
    lastService: string,
    lastServiceDate: string
}
export default function PetCard({ petName, petType, lastService, lastServiceDate }: PetCardProps) {
    return (
        <div className="w-[90%] md:w-full bg-neutral-100 border border-neutral-300 rounded-2xl">
            <div className="w-[90%] relative h-30">
                <Image src={`/icons/control-panel/pets/${petType}-pet-icon.svg`}
                    fill
                    alt={petName + 'icon'}
                    className="object-contain"
                />
            </div>
            <p className="text-lg p-2 rounded-full bg-neutral-300">{petName}</p>
            <p className="text-md text-neutral-700">{petType}</p>
            <p>Last service: {lastService}</p>
        </div>
    )
}