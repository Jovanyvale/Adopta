'use client'
import ControlPanelNavItem from "@/app/components/ControlPanelNavItem";
import { useState } from "react";

export default function ControlPanelLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

    const [popUp, setPopUp] = useState<boolean>(false)

    function handleClick(param: boolean) {
        setPopUp(param)
    }



    return (
        <>
            {/* Pop up code */}
            {
                popUp &&
                <div className="fixed  w-screen h-screen bg-black/40 z-20 flex items-center justify-center">
                    <div className="w-130 p-12 flex-col items-center justify-center mb-40 bg-white rounded-lg">
                        <p className="text-lg text-center pb-5">Do you want to logout?</p>
                        <div className="flex gap-6">
                            <button className="p-2 rounded-lg bg-neutral-400 text-black hover:cursor-pointer w-full" onClick={() => handleClick(false)}>
                                Cancel
                            </button>
                            <form action="/auth/logout" method="post" className="w-full">
                                <button className="p-2 rounded-lg bg-black text-white hover:cursor-pointer w-full">
                                    Logout
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            }

            {/* Base code */}
            < div className="flex md:flex-row flex-col h-[calc(100vh-96px)] mt-6" >
                <aside className="md:w-[22%] w-full flex flex-col justify-between bg-neutral-200 rounded-tr-lg">

                    <div className="md:flex md:flex-col grid grid-cols-2 grid-rows-2">
                        {/* Control panel */}
                        <ControlPanelNavItem name="Main panel" image="/icons/control-panel/control-panel-icon.svg" route="/main-panel" />

                        {/* Profile */}
                        <ControlPanelNavItem name="Profile" image="/icons/control-panel/profile-icon.svg" route="/control-panel/profile" />

                        {/* Pets */}
                        <ControlPanelNavItem name="Pets" image="/icons/control-panel/pet-icon.svg" route="/control-panel/pets" />

                        {/* Services */}
                        <ControlPanelNavItem name="Services" image="/icons/control-panel/services-icon.svg" route="/control-panel/services" />
                    </div>

                    {/* Logut button */}
                    <div className="md:flex my-5 mx-4 hidden">
                        <button className="p-2 rounded-lg bg-black text-white w-full h-14 hover:cursor-pointer" onClick={() => handleClick(true)}>
                            Logout
                        </button>
                    </div>
                </aside>

                <main className="flex-1">
                    {children}
                </main>
            </div >
        </>
    )
}