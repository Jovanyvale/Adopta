import Image from "next/image"

export default function About() {

    return (
        <>
            <section>
                <div className="flex md:mt-18 mt-8 md:w-[70%] w-[90%] mx-auto md:h-110">
                    <div className="flex flex-col md:w-[70%] self-center bg-linear-to-bl from-[#58880f] via-[#1cc459] to-[#0f7631] p-8 rounded-2xl text-white">
                        <h2 className="md:text-4xl text-2xl font-semibold">About us</h2>
                        <p className="lg:text-xl md:lg text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus voluptates alias, laborum, asperiores nulla facilis similique quia tempore maxime, facere exercitationem amet rem ab itaque quidem ratione. Aspernatur, dolore cumque? Lorem ipsum dolor sit, amet consectetur adipisicing elit. Magni dicta voluptas impedit ex deleniti cum ducimus a, blanditiis delectus tempore nam eum vitae eos ab animi totam suscipit harum deserunt.</p>
                    </div>
                    <div className="relative md:w-[30%] md:inline-block hidden">
                        <Image src={'/images/about_dog.png'}
                            fill
                            alt="AboutImage"
                            className="object-contain"
                        />
                    </div>
                </div>
            </section>

            <section className="flex justify-between mt-12 lg:w-[70%] md:w-[90%] md:flex-row flex-col  mx-auto md:gap-0 gap-4">
                <div className="p-3 bg-black text-white rounded-full flex gap-1 md:w-auto w-70 self-center justify-center">
                    <div className="flex">
                        <div className="relative w-5">
                            <Image src={'/icons/location.svg'}
                                fill
                                alt="icon"
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <p>San Diego, CA</p>
                </div>

                <div className="p-3 bg-black text-white rounded-full flex gap-1 md:w-auto w-70 self-center justify-center">
                    <div className="flex">
                        <div className="relative w-5">
                            <Image src={'/icons/street.svg'}
                                fill
                                alt="icon"
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <p>123 Adpt St. 987</p>
                </div>

                <div className="p-3 bg-black text-white rounded-full flex gap-1 md:w-auto w-70 self-center justify-center">
                    <div className="flex">
                        <div className="relative w-5">
                            <Image src={'/icons/mail.svg'}
                                fill
                                alt="icon"
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <p>adoptamail@hotmail.com</p>
                </div>

                <div className="p-3 bg-black text-white rounded-full flex gap-1 md:w-auto w-70 self-center justify-center">
                    <div className="flex">
                        <div className="relative w-5">
                            <Image src={'/icons/phone.svg'}
                                fill
                                alt="icon"
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <p>(707)-1234-567</p>
                </div>
            </section>
        </>
    )
}