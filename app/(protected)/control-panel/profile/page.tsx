import Image from "next/image"
import { supabaseBrowser } from "@/lib/supabase/browser"
import { useEffect, useState } from "react"

export default function Profile() {

    const [user, setUser] = useState()

    useEffect(() => {
        async function getUserData() {
            const res = await fetch('/api/db', {
                method: 'GET',
                credentials: 'include'
            })
            const data = await res.json()
            setUser(data)
        }
        getUserData()
    }, [])

    return (
        < div className="flex" >
            <div className="bg-neutral-200" onClick={ }>
                <p></p>
                <div>
                    <Image src={'/icons/control-panel/profile/id-icon.svg'} />
                </div>
            </div>
            <div></div>
            <div></div>
            <div></div>
        </div >
    )
}