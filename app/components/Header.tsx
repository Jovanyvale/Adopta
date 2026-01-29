'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useEffect, useState } from "react";

export default function Header() {


    const [isLogedIn, setIsLogedIn] = useState(false)
    const [open, setOpen] = useState(false)
    const pathName = usePathname();

    //When click on a link closes the menu
    const closeMenu = () => {
        setOpen(false)
    }

    //Verfiy if there is a loged user when the page loads
    useEffect(() => {
        supabaseBrowser.auth.onAuthStateChange((_event, session) => {
            setIsLogedIn(!!session?.user);
        });
    }, []);

    const HIDDEN_ROUTES = [
        '/login',
        '/register',
        '/forgot-password',
        '/password-reset',
    ]
    const hideHeader = HIDDEN_ROUTES.includes(pathName)

    return (
        <div className="sticky top-0 bg-white z-50">
            {/*If is on login or register path the header doesnt shows*/}
            {!hideHeader && (
                <header className="flex justify-between items-center md:p-4 p-3 mx-auto ">
                    <Link href={'/'} className="md:text-4xl text-3xl font-semibold">Adopta</Link>
                    <div className="md:flex gap-5 items-center hidden">
                        <Link href="/about">About</Link>
                        <Link href="/adoptions">Adoptions</Link>
                        <Link href="/services">Services</Link>
                        <Link href={isLogedIn ? '/control-panel' : '/login'} className="text-white px-6 py-2 bg-black rounded-md">{isLogedIn ? 'My Account' : 'Login'}</Link >
                    </div>

                    <button
                        onClick={() => setOpen(!open)}
                        className="flex flex-col md:hidden justify-between w-8 h-6 z-20"
                    >
                        <span className="h-1 w-full bg-black rounded" />
                        <span className="h-1 w-full bg-black rounded" />
                        <span className="h-1 w-full bg-black rounded" />
                    </button>

                    <div
                        className={`fixed top-0 left-full h-screen w-62 bg-white z-10 shadow-lg transform transition-transform duration-300 ${open ? '-translate-x-full' : ' translate-x-0'}`}>
                        <nav className="p-6">
                            <div className="space-y-6 flex flex-col mt-18">
                                <Link href={isLogedIn ? '/control-panel' : '/login'} onClick={closeMenu} className="text-white px-6 py-2 text-center mb-10 bg-black rounded-md">{isLogedIn ? 'My Account' : 'Login'} </Link >
                                <Link href={'/'} onClick={closeMenu} className="underline">Home</Link >
                                <Link href={'/services'} onClick={closeMenu} className="underline">Services</Link >
                                <Link href={'/adoptions'} onClick={closeMenu} className="underline">Adoptions</Link >
                                <Link href={'/about'} onClick={closeMenu} className="underline">About</Link >
                            </div>

                            {isLogedIn &&
                                <form action="/auth/logout" method="post" className="mt-10">
                                    <button className="text-white px-4 py-2 text-center mb-10 bg-black rounded-md">
                                        Logout
                                    </button>
                                </form>
                            }
                        </nav>
                    </div>


                </header>

            )
            }
        </div >
    )
}