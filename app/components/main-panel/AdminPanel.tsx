'use client'
import Image from "next/image"
export default function AdminPanel() {

    return (
        <>
            <h2>Admin dashboard</h2>
            <div className="grid grid-cols-5 grid-rows-7 gap-4 ">
                <div className="col-span-2 row-span-4">
                    <button className="bg-blue-100 border border-blue-200 rounded-lg hover:cursor-pointer flex">
                        <div className="w-20 h-20 bg-blue-400 rounded-full relative">
                            <Image src={'/icons/admin-panel/add-icon.svg'}
                                alt="Register service icon"
                                width={60}
                                height={60}
                            />
                        </div>
                        <p>Register service</p>
                    </button>
                </div>

                <div className="col-span-3 row-span-4 col-start-3 row-start-1">2</div>

                <div className="col-span-5 row-span-3 col-start-1 row-start-5">3</div>
            </div>
        </>
    )
}