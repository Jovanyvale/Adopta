'use client'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function ControlPanelLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

    const router = useRouter();
    const pathName = usePathname();

    return (
        <div className="flex mt-6 h-full">
            <aside className="w-[22%] hidden md:flex flex-col bg-neutral-200 md:fixed h-full">

                {/* Control panel */}
                <Link href={'/control-panel'} className={`flex h-14 border-b items-center ${pathName == '/control-panel' && 'bg-linear-to-r from-transparent via-transparent to-blue-200 border-r-6 border-r-blue-500'}`}>
                    <div className="relative w-10 h-[50%]">
                        <Image src={'/icons/control-panel/control-panel-icon.svg'}
                            fill
                            alt="Profile"
                            className=""
                        />
                    </div>
                    <p>Control panel</p>
                </Link>

                {/* Profile */}
                <Link href={'/control-panel/profile'} className={`flex h-14 border-b items-center ${pathName == '/control-panel/profile' && 'bg-linear-to-r from-transparent via-transparent to-blue-200 border-r-6 border-r-blue-500'}`}>
                    <div className="relative w-10 h-[50%]">
                        <Image src={'/icons/control-panel/profile-icon.svg'}
                            fill
                            alt="Profile"
                            className=""
                        />
                    </div>
                    <p>Profile</p>
                </Link>

                {/* Pets */}
                <Link href={'/control-panel/pets'} className={`flex h-14 border-b items-center ${pathName == '/control-panel/pets' && 'bg-linear-to-r from-transparent via-transparent to-blue-200 border-r-6 border-r-blue-500'}`}>
                    <div className="relative w-10 h-[50%]">
                        <Image src={'/icons/control-panel/pet-icon.svg'}
                            fill
                            alt="Profile"
                            className=""
                        />
                    </div>
                    <p>Pets</p>
                </Link>

                {/* Services */}
                <Link href={'/control-panel/services'} className={`flex h-14 border-b items-center ${pathName == '/control-panel/services' && 'bg-linear-to-r from-transparent via-transparent to-blue-200 border-r-6 border-r-blue-500'}`}>
                    <div className="relative w-10 h-[50%]">
                        <Image src={'/icons/control-panel/services-icon.svg'}
                            fill
                            alt="Profile"
                            className=""
                        />
                    </div>
                    <p>Services</p>
                </Link>
            </aside>
            <main>
                {children}
            </main>
        </div >
    )
}