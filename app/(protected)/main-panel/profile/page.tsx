'use client'

import { useEffect, useState } from "react"
import { ApiGetUser } from "@/app/types/apiGetUser"

type UpdatedInfo = {
    name: string,
    lastname: string,
    phone: string
}

export default function Profile() {

    const [userData, setUserData] = useState<ApiGetUser>()
    const [updatedInfo, setUpdatedInfo] = useState<UpdatedInfo>({
        name: "",
        lastname: "",
        phone: ""
    })
    const [updateStatus, setUpdateStatus] = useState('')
    const [popup, setPopup] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getUser() {
            try {
                const res = await fetch('/api/db', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    throw new Error('Error getting user data')
                }
                const data = await res.json()

                setUserData({
                    data: data,
                    error: null,
                    loading: false
                })
                setUpdatedInfo({
                    name: data.profile.name,
                    lastname: data.profile.lastname,
                    phone: data.profile.phone ?? ''
                })
                setLoading(false)

            } catch (err) {
                setUserData({
                    data: null,
                    error: err instanceof Error ? err.message : 'Unexpected error',
                    loading: false
                })
            }

        }
        getUser()
    }, [])

    //Update info function
    async function handleUpdateInfo(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const res = await fetch('/api/db/updateInfo', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedInfo)
        })

        const data = await res.json()

        if (!res.ok) {
            setUpdateStatus(data.message)
            setTimeout(() => {
                setPopup(false)
            }, 2600);
            return
        }

        setUpdateStatus(data.message)

    }

    function handlePopup(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        setPopup(!popup)
    }

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <>
            <div className="bg-neutral-200 rounded-xl md:w-[65%] mt-30 w-[90%] mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-base md:text-lg">
                {/* Name */}
                <span className="font-medium text-neutral-700">Name</span>
                <span className="bg-neutral-300 rounded-md px-3 py-1 w-fit">
                    {userData?.data?.profile.name}
                </span>

                {/* Lastname */}
                <span className="font-medium text-neutral-700">Lastname</span>
                <span className="bg-neutral-300 rounded-md px-3 py-1 w-fit">
                    {userData?.data?.profile.lastname}
                </span>

                {/* Phone */}
                <span className="font-medium text-neutral-700">Phone</span>
                {userData?.data?.profile.phone ? (
                    <span className="bg-neutral-300 rounded-md px-3 py-1 w-fit">
                        {userData?.data?.profile.phone}
                    </span>
                ) : (
                    <span className="text-neutral-500 italic">
                        No phone registered
                    </span>
                )}

                {/* Email */}
                <span className="font-medium text-neutral-700">Email</span>
                <span className="bg-neutral-300 rounded-md px-3 py-1 w-fit break-all">
                    {userData?.data?.profile.email}
                </span>
            </div>

            {popup &&
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl w-[90%] max-w-110 p-6 shadow-lg">
                        <p className="text-lg font-semibold text-center">Update personal info</p>
                        <form action="" className="flex flex-col gap-4" onSubmit={handleUpdateInfo}>
                            {/* Name field */}
                            <div>
                                <label htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    minLength={2}
                                    pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ ]+"
                                    className="p-2 bg-neutral-200 sborder border-default-medium text-heading rounded-md text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs" value={updatedInfo.name}
                                    onChange={(e) => setUpdatedInfo({ ...updatedInfo, name: e.target.value })}
                                />
                            </div>

                            {/* Lastname field */}
                            <div>
                                <label htmlFor="lastname">Lastname</label>
                                <input
                                    id="lastname"
                                    type="text"
                                    required
                                    minLength={2}
                                    pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ ]+"
                                    className="p-2 bg-neutral-200 sborder border-default-medium text-heading rounded-md text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs"
                                    value={updatedInfo.lastname}
                                    onChange={(e) => setUpdatedInfo({ ...updatedInfo, lastname: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="phone">Phone</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]{10}"
                                    maxLength={10}
                                    placeholder="Phone number"
                                    className="p-2 bg-neutral-200 sborder border-default-medium text-heading rounded-md text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs"
                                    value={updatedInfo.phone}
                                    onChange={e =>
                                        setUpdatedInfo(prev => ({
                                            ...prev,
                                            phone: e.target.value.replace(/\D/g, "")
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex md:flex-row flex-col justify-around items-center mt-6 md:gap-0 gap-5">
                                <button onClick={() => setPopup(false)} className="p-2 rounded-full bg-neutral-200 w-38">Cancel</button>
                                <button type="submit" className="p-2 rounded-full bg-blue-400 w-38 disabled:opacity-50"
                                    disabled={
                                        userData?.data?.profile?.name === updatedInfo?.name &&
                                        userData?.data?.profile?.lastname === updatedInfo?.lastname &&
                                        userData?.data?.profile?.phone === updatedInfo?.phone
                                    }>Submit changes</button>
                            </div>
                        </form>
                    </div >
                </div >
            }

            <button onClick={handlePopup} className="p-3 bg-black rounded-full mx-auto text-white hover:cursor-pointer flex mt-8">
                Update info
            </button>
        </>
    )
}