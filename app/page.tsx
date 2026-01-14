import Link from "next/link";
import Image from "next/image";
import { services } from "./data/services";
import ServiceCard from "./components/ServiceCard";
import AiAssistance from "./components/AiAssistance";
import CountUp from "./components/CountUp";

export default function Home() {
  return (
    <div className="">
      <main>
        <div className="grid md:grid-cols-2 gap-6 items-center w-[90%] mx-auto md:mt-50 mt-10">
          <div className="max-w-150 md:text-start text-center mx-auto">
            <h2 className="md:text-4xl text-2xl font-semibold mb-2">Welcome to Adopta</h2>
            <p className="md:text-2xl text-md">The place where you can easily manage your pet&apos;s care.
              Book appointments, track vaccinations, and access essential veterinary services all in one platform, designed to make caring for your pets simple and stress-free.</p>
          </div>
          <img src="/images/DogAndCat.png" alt="Welcome image" className="w-200 " />
        </div>

        {/* Adoptions */}
        <section className="flex flex-col adopt_section md:mt-50 mt-30 h-auto w-full mx-auto md:p-16 p-4 py-10 items-center justify-around gap-12 ">
          <div className="text-center text-white text-shadow-lg">
            <h2 className="md:text-5xl text-2xl font-semibold mb-5">Adopt a friend</h2>
            <p className="md:text-2xl text-md md:max-w-240">Explore our complete catalog of pets ready for adoption and give a loving home to a new companion.</p>
          </div>
          <Link href='/' className="p-3 px-9 text-xl bg-white rounded-2xl text-black font-semibold">Adopt now</Link>
          <img src="/images/adoption-section-image.jpg" alt="adoption dogs" className="rounded-xl md:w-140 w-full" />
        </section>

        {/* Ai Diagnostic */}
        <section className="grid md:grid-cols-6 md:mt-20">
          <div className="relative md:col-start-1 md:col-end-3 md:block hidden">
            <Image src={'/images/iguana.png'}
              fill
              alt={"Iguana"}
              className="object-contain"
            />
          </div>
          <div className="md:w-[80%] w-[95%] mx-auto mt-32 border-2 border-neutral-400 rounded-xl overflow-hidden bg-linear-to-t from-slate-200 to-transparent md:col-start-3 md:col-end-7">
            <AiAssistance />
          </div>
        </section>

        {/* Grooming section */}
        <section>
          <div className="flex flex-col items-center w-full mx-auto md:mt-70 mt-40 gap-10 bg-red-300 md:px-20 px-6 pt-20 pb-50 text-white text-center">
            <h2 className="md:text-4xl text-2xl font-bold text-shadow-lg">Grooming sesions</h2>
            <p className="md:text-2xl text-lg text-center max-w-260 font-semibold text-shadow-lg">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab accusamus, eligendi eum nemo quos officia? Nisi sequi itaque, exercitationem eos labore hic. At magnam, consequatur ab ut pariatur odio error.</p>
            <Link href={'/'} className="bg-black p-4 md:text-xl text-md font-semibold rounded-lg">Schedule an appointment</Link>
          </div>
          <div className="justify-center relative md:h-125 h-90 w-auto mt-[-150]">
            <Image
              src={"/images/services/groomingDog.png"}
              fill
              alt="Dog"
              className="object-contain"
            />
          </div>
        </section>

        {/* Services list */}
        <h2 className="text-4xl font-bold mt-60 mb-20 text-center">Our Services</h2>
        <section className="services-section flex flex-col md:w-[75%] w-[90%] mx-auto md:gap-12 gap-8">
          {services.map((service, index) =>
            <ServiceCard
              key={index + 1}
              title={service.title}
              description={service.description}
              image={service.image}
              url={service.url}
              buttonText={service.buttonText}
            />
          )}
        </section>
      </main>
    </div >
  );
}
