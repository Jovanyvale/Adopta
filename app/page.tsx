import Link from "next/link";
import Image from "next/image";
import { services } from "./data/services";
import ServiceCard from "./components/ServiceCard";
import AiAssistance from "./components/AiAssistance";

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
        <section className="md:mt-50 mt-30">
          <div className="relative w-[92%] md:w-[90%] mx-auto overflow-hidden rounded-4xl bg-[#0f4f2a] px-5 md:px-12 py-10 md:py-14">
            <div className="absolute -top-20 -left-10 h-56 w-56 rounded-full bg-[#36c667]/35 blur-2xl" />
            <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-[#95e3aa]/30 blur-3xl" />

            <div className="relative z-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
              <div className="text-white">
                <p className="inline-block rounded-full bg-white/15 px-4 py-2 text-sm md:text-base font-medium mb-4">
                  Find your new best friend
                </p>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                  Adopt a pet and change two lives at once
                </h2>
                <p className="mt-4 text-base md:text-xl max-w-2xl text-white/90">
                  Explore pets ready for adoption and connect with companions looking
                  for a safe, loving home.
                </p>

                <Link
                  href="/adoptions"
                  className="inline-block mt-8 rounded-2xl bg-white px-7 py-3 text-lg font-semibold text-[#0f4f2a] hover:bg-[#ebf7ef] transition-colors"
                >
                  Go to Adoptions
                </Link>
              </div>

              <div className="relative h-80 md:h-96">
                <div className="absolute inset-0 rounded-[1.75rem] border border-white/25 bg-white/10" />
                <div className="absolute inset-3 overflow-hidden rounded-3xl">
                  <Image
                    src="/images/adoption-section-image.jpg"
                    fill
                    alt="Pets for adoption"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
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

        {/* Appointment section */}
        <section>
          <div className="flex flex-col items-center w-full mx-auto md:mt-70 mt-40 gap-10 bg-red-300 md:px-20 px-6 pt-20 pb-50 text-white text-center">
            <h2 className="md:text-4xl text-2xl font-bold text-shadow-lg">Pets appointments</h2>
            <p className="md:text-2xl text-lg text-center max-w-260 font-semibold text-shadow-lg">Book your pet&apos;s next visit in minutes. Pick a date, stay on top of checkups, and keep every appointment organized in one place.</p>
            <Link href={'/main-panel/pets'} className="bg-black p-4 md:text-xl text-md font-semibold rounded-lg">Schedule an appointment</Link>
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
        <h2 className="text-4xl font-bold mt-52 mb-14 text-center">Our Services</h2>
        <section className="services-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:w-[85%] w-[92%] mx-auto md:gap-6 gap-5">
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
