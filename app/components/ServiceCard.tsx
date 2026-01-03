import Image from "next/image"
import { Service } from "../types/Services"
import Link from "next/link"

export default function ServiceCard({ title, description, image, url, buttonText }: Service) {

    return (
        <div className="flex flex-col md:flex-row md:even:flex-row-reverse h-120 md:gap-10 gap-4 bg-neutral-200 rounded-xl p-4">
            <div className="flex flex-col flex-1 self-center items-start gap-5 md:mx-6">
                <h3 className="md:text-2xl text-xl font-semibold">{title}</h3>
                <p className="md:text-lg text-sm">{description}</p>
                <Link href={url} className="p-3 bg-black text-white rounded-lg">{buttonText}</Link>
            </div>
            <div className="relative flex-1">
                <Image
                    src={`/images/services/${image}`}
                    fill
                    alt={image}
                    className="object-cover rounded-xl"
                />
            </div>
        </div>
    )
}