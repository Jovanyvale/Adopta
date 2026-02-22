import Image from "next/image"
import type { RegisteredService } from "@/app/types/registeredServices"
import { useState } from "react"
import SpotlightCard from "../SpotlightCard"
import { Schedule } from "@/app/types/schedule"
import { useRouter } from "next/navigation"

type PetEditPopUpType = {
    petId: number,
    petName: string,
    petType: string,
    services: RegisteredService[],
    schedules: Schedule[],
    onClose: () => void
}

export default function PetEditPopUp({ petId, petName, petType, services, schedules, onClose }: PetEditPopUpType) {
    const router = useRouter()

    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(petName)
    const [type, setType] = useState(petType)
    const [fetchStatus, setFetchStatus] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setFetchStatus('fetching')
        try {
            const res = await fetch('/api/db/updatePet', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    petName: name,
                    petType: type,
                    petId
                })
            })

            if (!res.ok) {
                setFetchStatus('error')

                setTimeout(() => {
                    onClose()
                    setFetchStatus('')
                }, 2600);
                return
            }

            setFetchStatus('success')
            setTimeout(() => {
                onClose()
                setFetchStatus('')
            }, 2600);
        } catch (err) {
            setFetchStatus('error')
            setTimeout(() => {
                onClose()
                setFetchStatus('')
            }, 2600)
        }
    }

    async function handleDelete() {
        setShowDeleteConfirm(!showDeleteConfirm)
        try {
            const res = await fetch('/api/db/deletePet', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    petId
                })
            })

            if (!res.ok) {
                setFetchStatus('deleteError')

                setTimeout(() => {
                    onClose()
                    setFetchStatus('')
                }, 2600);
                return
            }

            setFetchStatus('deleteSuccess')
            setTimeout(() => {
                onClose()
                setFetchStatus('')
            }, 2600);
        } catch (err) {
            setFetchStatus('deleteError')
            setTimeout(() => {
                onClose()
                setFetchStatus('')
            }, 2600)
        }
    }

    async function handleDeleteAppointment() {
        if (schedules.length < 1) {
            return
        }

        const nextSchedule = schedules[0]
        setFetchStatus('deleteScheduleFetching')
        try {
            const res = await fetch('/api/db/deleteSchedule', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    petId,
                    scheduleId: nextSchedule.id
                })
            })

            if (!res.ok) {
                setFetchStatus('deleteScheduleError')
                setTimeout(() => {
                    onClose()
                    setFetchStatus('')
                }, 2600)
                return
            }

            setFetchStatus('deleteScheduleSuccess')
            setTimeout(() => {
                onClose()
                setFetchStatus('')
            }, 2600)
        } catch (err) {
            setFetchStatus('deleteScheduleError')
            setTimeout(() => {
                onClose()
                setFetchStatus('')
            }, 2600)
        }
    }

    function handleAppointment() {
        const params = new URLSearchParams({
            petId: String(petId),
            petType,
        })

        onClose()
        router.push(`/appointments?${params.toString()}`)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 flex-col">

            {fetchStatus === '' && (
                <div className="w-[95%] max-w-sm md:w-[90%] md:max-w-240 md:h-120 md:p-8 p-3 bg-white rounded-xl overflow-y-auto gap-3 max-h-[85vh] md:max-h-320 grid grid-cols-1 md:grid-cols-3 md:grid-rows-5">

                    {/* Icon container */}
                    <div className="order-2 md:order-0 md:col-span-1 md:row-span-5 md:col-start-1 md:row-start-1 flex flex-col items-center md:items-start text-center md:text-left mx-auto my-auto w-full md:w-[80%]">
                        <div className="relative md:h-32 md:w-32 h-22 w-22 flex items-center justify-center bg-white rounded-xl border border-neutral-300 mb-2">
                            <div className="relative md:h-16 md:w-16 w-10 h-10">
                                <Image
                                    src={`/icons/control-panel/pets/${petType}-pet-icon.svg`}
                                    fill
                                    alt={petName + ' icon'}
                                    className="object-contain"
                                />
                            </div>

                        </div>

                        {editing
                            ? <form onSubmit={handleSubmit} className="w-full bg-neutral-100 border border-neutral-300 rounded-xl p-3 flex flex-col gap-3">
                                <p className="text-sm text-neutral-600">Id: <span className="text-black">{petId}</span></p>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="name" className="text-sm font-medium text-neutral-700">Name</label>
                                    <input type="text"
                                        id="name"
                                        required
                                        maxLength={16}
                                        minLength={1}
                                        pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ ]+"
                                        title="Only letters and spaces are allowed."
                                        defaultValue={petName}
                                        onChange={e => setName(e.target.value)}
                                        className="p-2 bg-white border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="petType" className="text-sm font-medium text-neutral-700">Type</label>
                                    <select id="petType"
                                        className="p-2 bg-white border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                                        defaultValue={petType}
                                        onChange={e => setType(e.target.value)}>
                                        <option value="other">Other</option>
                                        <option value="dog">Dog</option>
                                        <option value="cat">Cat</option>
                                        <option value="rabbit">Rabbit</option>
                                        <option value="bird">Bird</option>
                                        <option value="rodent">Rodent</option>
                                        <option value="reptile">Reptile</option>
                                    </select>
                                </div>

                                <button type="submit" className="p-2 bg-black rounded-lg text-white">
                                    Submit changes
                                </button>
                            </form>

                            : <div className="flex flex-col gap-1 text-sm text-neutral-600">
                                <p>Id: <span className="text-black">{petId}</span></p>

                                <p className="flex items-center gap-1 w-full">
                                    <span>Name:</span>
                                    <span className="text-black truncate block max-w-[140px]">{petName.charAt(0).toUpperCase() + petName.slice(1)}</span>
                                </p>

                                <p>Type: <span className="text-black">{petType.charAt(0).toUpperCase() + petType.slice(1)}</span></p>
                            </div>
                        }
                    </div>

                    {/* Edit and delete buttons */}
                    <div className="order-1 md:order-0 md:col-span-1 md:row-span-1 md:col-start-3 md:row-start-1 h-auto">
                        <div className="w-full bg-neutral-100 border border-neutral-300 rounded-xl p-3 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200 transition-colors"
                                onClick={() => setEditing(!editing)}
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Renders all the services */}
                    <div className="order-3 md:order-0 md:col-span-1 md:row-span-5 md:col-start-2 md:row-start-1 overflow-y-auto text-sm gap-2 flex flex-col min-h-0">
                        <div className="grid grid-cols-3 text-center bg-black text-white rounded-md">
                            <p>Id</p>
                            <p>Service</p>
                            <p>Date</p>
                        </div>
                        {services.length > 0
                            ? services.map((service) => (
                                <div key={service.id} className="w-full p-2 bg-neutral-800 text-white rounded-md grid grid-cols-3 justify-items-center items-center">
                                    <div className="flex flex-col">
                                        <p>{service.id}</p>
                                    </div>

                                    <p className="capitalize">{service.service}</p>

                                    <div className="flex flex-col">
                                        <p className="text-xs">{new Intl.DateTimeFormat('en-US', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                        }).format(new Date(service.created_at))}</p>
                                    </div>
                                </div>
                            ))
                            : <p className="w-full p-2 bg-neutral-800 text-white rounded-md">No services yet</p>
                        }
                    </div>

                    {/* Appointment div */}
                    <div className="order-4 md:order-0 md:col-span-1 md:row-span-4 md:col-start-3 md:row-start-2 flex flex-col items-center gap-2">
                        <SpotlightCard className="col-span-3 row-span-4 row-start-3 flex flex-col gap-2 items-center justify-center bg-neutral-100 h-full">
                            <p>Next appointment</p>
                            <p className="bg-red-500 text-white p-3 rounded-md text-center text-sm">
                                {schedules.length > 0
                                    ? new Intl.DateTimeFormat('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    }).format(new Date(schedules[0].date))
                                    : "You don't have any appointments scheduled."
                                }
                            </p>

                            {schedules.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleDeleteAppointment}
                                    className="p-3 text-sm bg-red-600 rounded-2xl text-white hover:cursor-pointer"
                                >
                                    Delete next appointment
                                </button>
                            )}
                        </SpotlightCard>

                        <button
                            type="button"
                            onClick={handleAppointment}
                            className="p-3 text-sm bg-neutral-800 rounded-2xl text-white hover:cursor-pointer">
                            Make an appointment
                        </button>


                    </div>

                </div>
            )}

            {fetchStatus == 'fetching' && (
                <div className="bg-white rounded-xl w-[90%] max-w-110 p-6 shadow-lg flex flex-col items-center">
                    <p>Updating pet...</p>
                </div>
            )}
            {fetchStatus == 'deleteScheduleFetching' && (
                <div className="bg-white rounded-xl w-[90%] max-w-110 p-6 shadow-lg flex flex-col items-center">
                    <p>Deleting appointment...</p>
                </div>
            )}

            {/* Update popup */}
            {(fetchStatus === 'success' || fetchStatus === 'error') && (
                <div className="bg-white rounded-xl w-[90%] max-w-110 p-6 shadow-lg flex flex-col items-center">
                    <Image src={fetchStatus == 'error'
                        ? '/icons/control-panel/failure.svg'
                        : '/icons/control-panel/check.svg'}
                        width={50}
                        height={50}
                        alt="status"
                    />
                    <p>{fetchStatus == 'error'
                        ? 'Error updating pet'
                        : 'Pet updated'}</p>
                </div>)
            }

            {/* Delete popup */}
            {(fetchStatus === 'deleteSuccess' || fetchStatus === 'deleteError') && (
                <div className="bg-white rounded-xl w-[90%] max-w-110 p-6 shadow-lg flex flex-col items-center">
                    <Image src={fetchStatus == 'deleteError'
                        ? '/icons/control-panel/failure.svg'
                        : '/icons/control-panel/check.svg'}
                        width={50}
                        height={50}
                        alt="status"
                    />
                    <p>{fetchStatus == 'deleteError'
                        ? 'Error deleting pet'
                        : 'Pet deleted'}</p>
                </div>)
            }

            {/* Delete appointment popup */}
            {(fetchStatus === 'deleteScheduleSuccess' || fetchStatus === 'deleteScheduleError') && (
                <div className="bg-white rounded-xl w-[90%] max-w-110 p-6 shadow-lg flex flex-col items-center">
                    <Image src={fetchStatus == 'deleteScheduleError'
                        ? '/icons/control-panel/failure.svg'
                        : '/icons/control-panel/check.svg'}
                        width={50}
                        height={50}
                        alt="status"
                    />
                    <p>{fetchStatus == 'deleteScheduleError'
                        ? 'Error deleting appointment'
                        : 'Appointment deleted'}</p>
                </div>)
            }

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                        <p className="text-lg font-semibold text-neutral-900">Delete pet</p>
                        <p className="mt-2 text-sm text-neutral-600">
                            Are you sure you want to delete this pet? This action cannot be undone.
                        </p>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 transition-colors"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                                onClick={handleDelete}
                            >
                                Confirm delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button className="bg-neutral-200 p-3 rounded-full mt-6 mx-auto hover:cursor-pointer w-[95%] max-w-sm md:w-80 text-xl mb-4"
                onClick={onClose}>
                Close
            </button>

        </div >
    )
}
