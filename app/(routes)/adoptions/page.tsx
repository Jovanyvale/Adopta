import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

type AdoptionPet = {
    id: number | string;
    name: string;
    pet_type: string | null;
    image: string | null;
};

const FALLBACK_PET_IMAGE = "/images/adoptions/cat-box.png";

function formatPetType(type: string | null) {
    if (!type) {
        return "Other";
    }

    return type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function getAdoptionPets() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("adoptions")
        .select("id, name, pet_type, image")
        .order("id", { ascending: false });

    if (error || !data) {
        return {
            pets: [] as AdoptionPet[],
            loadError: true,
        };
    }

    return {
        pets: data as AdoptionPet[],
        loadError: false,
    };
}

export default async function Adoptions() {
    const { pets, loadError } = await getAdoptionPets();

    return (
        <main className="w-[92%] md:w-[85%] mx-auto mt-10 md:mt-16 mb-16 space-y-10">
            <section className="rounded-3xl bg-linear-to-r from-[#128a3f] to-[#23b358] text-white p-6 md:p-10 shadow-xl">
                <div className="grid md:grid-cols-2 md:gap-6 items-center">

                    <div className="relative h-52 md:h-64 w-full overflow-visible">
                        <Image
                            src="/images/adoptions/cat-box.png"
                            alt="Cat in a box"
                            fill
                            className="md:object-contain drop-shadow-2xl scale-[1.45] md:scale-[2] translate-x-4 -translate-y-15 md:-translate-y-14 object-cover"
                        />
                    </div>
                    <div className="space-y-3 z-10">
                        <h1 className="text-3xl md:text-5xl font-bold">Welcome to Pet Adoptions</h1>
                        <p className="text-base md:text-xl max-w-xl">
                            Meet loving pets waiting for a new family. Start your adoption
                            journey and find your next best friend.
                        </p>
                    </div>

                </div>
            </section>

            {pets.length > 0 ? (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map((pet) => {
                        const imageSrc = pet.image ?? FALLBACK_PET_IMAGE;
                        const type = formatPetType(pet.pet_type);

                        return (
                            <article key={pet.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
                                <div className="relative h-110 bg-[#f0f8f2]">
                                    <Image
                                        src={imageSrc}
                                        alt={pet.name}
                                        fill
                                        unoptimized
                                        className={pet.image ? "object-cover" : "object-contain p-4"}
                                    />
                                </div>
                                <div className="p-5">
                                    <p className="text-xs tracking-widest uppercase text-neutral-500">
                                        {type}
                                    </p>
                                    <h2 className="text-2xl font-semibold text-neutral-900">{pet.name}</h2>
                                </div>
                            </article>
                        );
                    })}
                </section>
            ) : (
                <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                    <p className="text-lg text-neutral-700">
                        {loadError ? "Could not load adoption pets right now." : "No adoption pets available yet."}
                    </p>
                </section>
            )}
        </main>
    );
}
