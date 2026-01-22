'use client'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import ControlPanelNavItem from "@/app/components/ControlPanelNavItem";

export default function ControlPanelLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

    const router = useRouter();
    const pathName = usePathname();

    return (
        <div className="flex h-[calc(100vh-128px)] mt-6">
            <aside className="w-[22%] hidden md:flex flex-col bg-neutral-200 rounded-tr-lg">

                {/* Control panel */}
                <ControlPanelNavItem name="Control panel" image="/icons/control-panel/control-panel-icon.svg" route="/control-panel" />

                {/* Profile */}
                <ControlPanelNavItem name="Profile" image="/icons/control-panel/profile-icon.svg" route="/control-panel/profile" />

                {/* Pets */}
                <ControlPanelNavItem name="Pets" image="/icons/control-panel/pet-icon.svg" route="/control-panel/pets" />

                {/* Services */}
                <ControlPanelNavItem name="Services" image="/icons/control-panel/services-icon.svg" route="/control-panel/services" />
            </aside>

            <main className="flex-1">
                {children}
            </main>
        </div >
    )
}