'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useEffect, useState } from "react";

export default function Header() {


    const [isLogedIn, setIsLogedIn] = useState(false)
    const pathName = usePathname();

    //Verfiy if there is a loged user when the page loads
    useEffect(() => {
        async function getUserInfo() {
            const { data } = await supabaseBrowser.auth.getUser();

            if (data) {
                setIsLogedIn(true)
            }
        }

        getUserInfo();
    }, [])

    const HIDDEN_ROUTES = [
        '/login',
        '/register',
        '/forgot-password',
        '/password-reset',
    ]
    const hideHeader = HIDDEN_ROUTES.includes(pathName)

    return (
        <div>
            {/*If is on login or register path the header doesnt shows*/}
            {!hideHeader && (
                <header className="flex justify-between items-center p-8 mx-auto">
                    <Link href={'/'} className="text-4xl font-semibold">Adopta</Link>
                    <div className="md:flex gap-5 items-center hidden">
                        <Link href="/about">About</Link>
                        <Link href="/adoptions">Adoptions</Link>
                        <Link href="/services">Services</Link>
                        <Link href={isLogedIn ? '/control-panel' : '/login'} className="text-white px-6 py-2 bg-black rounded-md">{isLogedIn ? 'My Account' : 'Login'}</Link >
                    </div>
                </header>)
            }
        </div >
    )
}