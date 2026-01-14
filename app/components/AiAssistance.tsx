'use client'
import { useState } from "react";
import Aurora from "./Aurora";
import SpotlightCard from "./SpotlightCard";

interface DiagnosticResponse {
    importance: "none" | "okay" | "warning" | "danger";
    message: string;
}

export default function AiAssistance() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<DiagnosticResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiAssisted, setAiAssited] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!prompt.trim()) return;

        setAiAssited(true);
        setIsLoading(true);
        setError(null);
        setResponse(null);

        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: prompt })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error en el diagnóstico");

        // Intentamos extraer y parsear el JSON de la respuesta
        const text = data.response;
        const jsonMatch = text.match(/\{.*\}/);

        if (jsonMatch) {
            const parsed: DiagnosticResponse = JSON.parse(jsonMatch[0]);
            setResponse(parsed);
        } else {
            // Si el modelo no devuelve JSON, creamos uno genérico
            setResponse({ importance: "warning", message: text });

        }
        setIsLoading(false)
    }

    // Colores según la importancia
    const cardStyles = {
        none: " border-neutral-300 text-black",
        okay: "border-green-500 text-green-800",
        warning: " border-yellow-500 text-yellow-800",
        danger: " border-red-500 text-red-800"
    };

    const auroraStyles = {
        none: ['#CFCFCF', '#9E9E9E', '#868686'],
        okay: ['#84E887', '#4FDE54', '#29D62F'],
        warning: ['#ECFF5C', '#E1FF00', '#B9D100'],
        danger: ['#F87C63', '#F4320B', '#C82909']
    }

    const importance = response?.importance

    return (
        <div>
            <Aurora colorStops={importance ? auroraStyles[importance] : ['#8AA3FF', '#2E5BFF', '#5C7FFF']} />
            <div className="max-w-2xl md:w-[90%] mx-auto md:p-6 p-4 pt-0 flex flex-col gap-6 md:mt-6 md:mb-18 mb-10">
                <div className="text-center">
                    <h2 className="md:text-3xl text-2xl font-bold text-blue-600">AI Quick Diagnostic</h2>
                    <p className="text-gray-500">Describe your pet&apos;s symptoms</p>
                </div>
                {!aiAssisted &&
                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            maxLength={250}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Example: My cat has been sneezing all day"
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all resize-none h-[90%] text-black"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || aiAssisted}
                            className={`mt-2 w-full p-3 rounded-lg font-semibold text-white transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200'
                                }`}
                        >
                            {isLoading ? "Loading" : "Get diagnostic"}
                        </button>
                    </form>
                }


                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                {response && (
                    <SpotlightCard spotlightColor='rgba(0, 0, 0, 0.20)'>
                        < div className={`p-5 rounded-lg text-center animate-fade-in ${cardStyles[response.importance]}`}>
                            <div className="flex items-center gap-2 mb-2 font-bold uppercase text-sm tracking-wider">
                                <span className="mx-auto text-lg">{response.importance}</span>
                            </div>
                            <p className="text-lg leading-relaxed italic">{response.message}</p>
                        </div>
                    </SpotlightCard>
                )}

                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        </div >
    );
}