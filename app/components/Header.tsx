'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {

    const pathName = usePathname();
    const hideHeader = pathName === '/login' || pathName === '/register'
    const adminHeader = pathName.startsWith("/admin")

    return (
        <div>
            {/*If is on login or register path the header doest shows*/}
            {!hideHeader &&
                <header className="flex justify-between items-center p-8 mx-auto">
                    <h1 className="text-3xl">Adopta</h1>
                    <div className="md:flex gap-5 items-center hidden">
                        <Link href="/">About</Link>
                        <Link href="/">Adoptions</Link>
                        <Link href="/">Services</Link>
                        <Link href="/login" className="text-white px-6 py-2 bg-black rounded-md">Login</Link >
                    </div>
                </header>
            }
        </div>
    )
}