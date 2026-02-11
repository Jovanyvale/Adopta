import { FormEvent, useEffect, useState } from "react"
import type { ApiGetUser } from "@/app/types/apiGetUser"
import { error } from "console"
import Image from "next/image"

type PetInfoPopUpProps = {
    onSuccess: () => void
    onClose: () => void
}
export default function PetInfoPopUp({ onSuccess, onClose }: PetInfoPopUpProps) {

    const [fetchStatus, setFetchStatus] = useState('')
    const [petData, setPetData] = useState({
        petName: '',
        petType: 'other'
    })

    //Post the pet
    //This fetch returns an error (or a null if it is successful) 
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setFetchStatus('fetching')
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
                setFetchStatus('error')

                setTimeout(() => {
                    onClose()
                    setFetchStatus('')
                }, 2600);
                return
            }

            const data = await res.json()

            if (data == null) {
                onSuccess()
                setFetchStatus('success')
                setTimeout(() => {
                    onClose()
                    setFetchStatus('')
                }, 2600)
            }
        } catch (err) {
            setFetchStatus('error')
            setTimeout(() => {
                onClose()
                setFetchStatus('')
            }, 2600)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            {fetchStatus == '' && (
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
            )}

            {/* When fetching */}
            {fetchStatus == 'fetching' && (
                < div className="bg-white rounded-xl w-[90%] max-w-110 p-6 shadow-lg flex flex-col items-center">
                    <p>Creating new pet...</p>
                </div>
            )}

            {(fetchStatus === 'success' || fetchStatus === 'error') && (
                < div className="bg-white rounded-xl w-[90%] max-w-110 p-6 shadow-lg flex flex-col items-center">
                    <Image src={fetchStatus == 'error'
                        ? '/icons/control-panel/failure.svg'
                        : '/icons/control-panel/check.svg'}
                        width={50}
                        height={50}
                        alt="status"
                    />
                    <p>{fetchStatus == 'error'
                        ? 'Error creating a new pet'
                        : 'New pet created'}</p>
                </div>)
            }


        </div>
    )
}