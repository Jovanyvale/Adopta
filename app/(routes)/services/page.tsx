import Service from "@/app/components/Service"
import { allServices } from "../../data/allServices"

export default function Services() {

    return (
        <>
            <h1 className="text-center text-2xl mt-16 mb-10">Services</h1>

            <div className="grid 2xl:grid-cols-4 md:grid-cols-2 gap-4 mx-auto">
                {allServices.map(s => <Service key={s.title} title={s.title} description={s.description} img={s.img} />)}
            </div>

        </>
    )
}