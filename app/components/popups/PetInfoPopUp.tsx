import { FormEvent, useEffect, useState } from "react"
import type { ApiGetUser } from "@/app/types/apiGetUser"

type PetInfoPopUpProps = {
    onSuccess: () => void
    onClose: () => void
}
export default function PetInfoPopUp({ onSuccess, onClose }: PetInfoPopUpProps) {

    const [userData, setUserData] = useState<ApiGetUser>({
        data: null,
        error: null,
        loading: false
    })
    const [fetchStatus, setFetchStatus] = useState('')
    const [petData, setPetData] = useState({
        petName: '',
        petType: 'other'
    })

    useEffect(() => {
        async function getUser() {
            try {
                const res = await fetch('/api/db', {
                    method: 'GET',
                    credentials: 'include'
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

            } catch (err) {
                setUserData(prev => ({ ...prev, error: 'Error getting user data' }))
            }
        }
        getUser()
    }, [])

    //Post the pet
    //This fetch returns an error (or a null if it is successful) 
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        try {
            const res = await fetch('/api/db/postPet',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(petData)
                }
            )

            if (!res.ok) {
                onClose()
                console.log('aca')
                return
            }

            const data = await res.json()

            if (data == null) {
                onSuccess()
            }
        } catch (err) {
            onClose()
            console.log('Falla')
        }

    }

    setInterval(() => {
        console.log(petData)
    }, 3500);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

                <div className="w-[90%] max-w-140 p-8 bg-white rounded-xl">
                    <p className="text-xl text-center mb-2">Add a pet</p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col">
                            <label htmlFor="petName">Name</label>
                            <input id="petName"
                                required
                                maxLength={16}
                                minLength={1}
                                type="text"
                                pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ ]+"
                                className="p-2 bg-neutral-200 sborder border-default-medium text-heading rounded-md text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs"
                                onChange={(e) => setPetData(prev => (
                                    {
                                        ...prev,
                                        petName: e.target.value
                                    }
                                ))}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="petName">Name</label>
                            <select id="petType"
                                className="p-2 bg-neutral-200 sborder border-default-medium text-heading rounded-md text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs"
                                value={petData.petType}
                                onChange={(e) => setPetData(prev => (
                                    {
                                        ...prev,
                                        petType: e.target.value
                                    }
                                ))}>
                                <option value="other">Other</option>
                                <option value="dog">Dog</option>
                                <option value="cat">Cat</option>
                                <option value="rabbit">Rabbit</option>
                                <option value="bird">Bird</option>
                                <option value="rodent">Rodent</option>
                                <option value="reptile">Reptile</option>
                            </select>
                        </div>

                        <div className="flex md:flex-row flex-col gap-5 self-center">
                            <button onClick={onClose} className="p-2 rounded-full bg-neutral-200 w-38">Cancel</button>

                            <button type="submit"
                                className="p-2 rounded-full bg-blue-400 w-38 disabled:opacity-50"
                                disabled={petData.petName.length == 0}>Submit</button>
                        </div>
                    </form>
                </div>

            </div>
        </>
    )
}