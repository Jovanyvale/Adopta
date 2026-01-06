import Link from "next/link"

export default function LoginForm() {

    function handleSubmit() {
        console.log(1)
    }



    return (
        <div className="flex flex-col mx-auto mt-20 items-center md:w-190 w-[90%] bg-neutral-200 shadow-md p-8 rounded-2xl">
            <h1 className="font-bold text-4xl">Adopta</h1>
            <p className="text-xl mt-1">Login form</p>
            <form onSubmit={handleSubmit} className="mt-10 md:w-[50%] w-full">
                <div className="flex flex-col gap-6">
                    <input type="email" placeholder="Email" defaultValue={"adoptaadmin@hotmail.com"} className="w-full rounded-md p-1 border-2 border-neutral-500" />
                    <input type="text" placeholder="Password" defaultValue={"adoptaadmin123"} className="w-full rounded-md p-1 border-2 border-neutral-500" />
                    <button type="submit" className="text-white bg-black p-2 rounded-md">Login</button>
                </div>
            </form>
            <div className="flex flex-col md:flex-row items-center gap-2 mt-8">
                <p>Do not have an account?</p>
                <Link href={'/'} className="text-blue-500 font-semibold">Register</Link>
            </div>
        </div>
    )
}