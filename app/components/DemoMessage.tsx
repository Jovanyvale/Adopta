export default function DemoMessage() {
    return (
        <div className="flex flex-col mt-15 items-center text-center gap-2 md:max-w-160 w-[90%] mx-auto">
            <p className="text-2xl">Important message</p>
            <p>This is a <span className="text-red-500">demo</span> aplication <br />
                use the following credentials to login and you can create an account if you want</p>

            <div className="mt-4 flex flex-col md:flex-row gap-4">
                <div className="bg-slate-200 p-3 rounded-lg">
                    <p className="text-lg font-semibold">Client account</p>
                    <p>Email: <span className="text-green-500">adoptaclient@hotmail.com</span></p>
                    <p>Password: <span className="text-green-500">adoptaclient123</span></p>
                </div>
                <div className="bg-slate-200 p-3 rounded-lg">
                    <p className="text-lg font-semibold">Client account</p>
                    <p>Email: <span className="text-green-500">adoptaclient@hotmail.com</span></p>
                    <p>Password: <span className="text-green-500">adoptaclient123</span></p>
                </div>
            </div>
        </div>
    )
}