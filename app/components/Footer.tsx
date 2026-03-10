'use client'
import { usePathname } from "next/navigation";

export default function Footer({ currentYear }: { currentYear: number }) {
    const pathname = usePathname()

    if (pathname.startsWith('/main-panel')) return null

    return (
        <footer className="border-t border-neutral-300 bg-neutral-100 px-6 py-4 text-center text-sm text-neutral-700">
            <p>&copy; {currentYear} Adopta. Created by <a className="text-blue-800 hover:cursor-pointer" href="https://github.com/Jovanyvale">Jovany Valenzuela</a></p>
        </footer>
    )
}