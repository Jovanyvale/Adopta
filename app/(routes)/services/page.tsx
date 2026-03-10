import Service from "@/app/components/Service"
import { allServices } from "../../data/allServices"

export default function Services() {

    return (
        <main className="mx-auto mb-20 mt-10 w-[92%] md:mt-14 md:w-[88%] lg:w-[84%]">
            <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
                <p className="inline-block rounded-full bg-[#e8f6ec] px-4 py-1 text-sm font-semibold text-[#1f7a3b]">
                    Pet Wellness
                </p>
                <h1 className="mt-3 text-3xl font-bold text-neutral-900 md:text-5xl">
                    Veterinary Services
                </h1>
                <p className="mt-3 text-sm text-neutral-600 md:text-base">
                    Explore high-quality care options for every stage of your pet&apos;s life.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {allServices.map(s => <Service key={s.title} title={s.title} description={s.description} img={s.img} />)}
            </div>
        </main>
    )
}
