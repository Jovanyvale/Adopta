import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

type ControlPanelNavItemsProps = {
    name: string
    image: string
    route: string
}
export default function ControlPanelNavItem({ name, image, route }: ControlPanelNavItemsProps) {

    const pathName = usePathname()

    return (
        <Link href={route} className={`flex h-14 items-center rounded-lg mx-4 my-3 p-2 bg-neutral-100 rounded- ${pathName == route && 'bg-linear-to-r from-transparent via-transparent to-blue-200 border-r-6 border-r-blue-500'}`}>
            <div className="relative w-10 h-[50%]">
                <Image src={image}
                    fill
                    alt={name}
                    className=""
                />
            </div>
            <p>{name}</p>
        </Link>
    )
}