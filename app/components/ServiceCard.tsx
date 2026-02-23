import Image from "next/image"
import { Service } from "../types/services"
import Link from "next/link"

export default function ServiceCard({ title, description, image, url, buttonText }: Service) {

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-xl bg-neutral-200">
            <div className="relative h-44 w-full">
                <Image
                    src={`/images/services/${image}`}
                    fill
                    alt={image}
                    className="object-cover"
                />
            </div>
            <div className="flex h-auto flex-col gap-3 p-4 ">
                <h3 className="text-lg font-semibold leading-tight">{title}</h3>
                <p className="text-sm leading-snug text-neutral-700">{description}</p>
                <Link href={url} className="mt-auto w-fit rounded-lg bg-black px-4 py-2 text-sm text-white">{buttonText}</Link>
            </div>
        </article>
    )
}
