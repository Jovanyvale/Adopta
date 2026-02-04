import Image from "next/image"

type ServicePropsType = {
    title: string,
    description: string,
    img: string
}
export default function Service({ title, description, img }: ServicePropsType) {

    return (
        <div className="flex flex-col bg-neutral-200 md:w-[22.5rem] w-[18rem] rounded-md p-4">
            <h2 className="text-center text-xl font-semibold my-1">
                {title}
            </h2>

            <div className="relative w-full md:h-56 h-36">
                <Image
                    src={img}
                    alt={`${title} image`}
                    fill
                    className="object-cover rounded-md"
                />
            </div>

            <p className="mt-2 text-center">{description}</p>
        </div>
    )
}