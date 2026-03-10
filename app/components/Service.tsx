import Image from "next/image"

type ServicePropsType = {
    title: string,
    description: string,
    img: string
}
export default function Service({ title, description, img }: ServicePropsType) {

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#d9ead5] bg-white shadow-[0_14px_35px_-22px_rgba(17,82,38,0.7)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_45px_-24px_rgba(25,122,53,0.6)]">
            <div className="relative h-52 w-full overflow-hidden md:h-60">
                <Image
                    src={img}
                    alt={`${title} image`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />
                <h2 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white drop-shadow-md">
                    {title}
                </h2>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="text-[0.95rem] leading-relaxed text-neutral-700">
                    {description}
                </p>
                <div className="mt-5 inline-flex w-fit items-center rounded-full border border-[#d8ead8] bg-[#f1f9f2] px-3 py-1 text-xs font-semibold tracking-wide text-[#196f34]">
                    Professional Care
                </div>
            </div>
        </article>
    )
}
