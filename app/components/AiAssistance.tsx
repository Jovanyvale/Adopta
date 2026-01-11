'use client'
import { useState } from "react";

export default function AiAssistance() {

    const [prompt, setPrompt] = useState('')
    const [response, setResponse] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                input: prompt
            })
        })

        const data = await res.json();
        console.log(data)
        setResponse(data.response)
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-3xl">AI Diagnostical</h2>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg hover:shadow-xl shadow-blue-400 mt-5">
                <input value={prompt} onChange={(e) => setPrompt(e.target.value)} type="text" />
                <button type="submit" className="p-2 bg-blue-400 rounded-md">Get diagnostic</button>
            </form>
            <p className="text-black text-xl">{response}</p>
        </div >
    )
}