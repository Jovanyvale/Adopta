'use client'
import { useState } from "react";

interface DiagnosticResponse {
    importancia: "okay" | "warning" | "danger";
    message: string;
}

export default function AiAssistance() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<DiagnosticResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
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
                setResponse({ importancia: "warning", message: text });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    // Colores según la importancia
    const cardStyles = {
        okay: "bg-green-100 border-green-500 text-green-800",
        warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
        danger: "bg-red-100 border-red-500 text-red-800"
    };

    return (
        <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-blue-600">Asistente Veterinario IA</h2>
                <p className="text-gray-500">Describe los síntomas de tu mascota</p>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ej: Mi perro no quiere comer y tiene la nariz seca..."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all resize-none h-32 text-black"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`mt-2 w-full p-3 rounded-lg font-semibold text-white transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200'
                        }`}
                >
                    {isLoading ? "Analizando síntomas..." : "Obtener Diagnóstico"}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    {error}
                </div>
            )}

            {response && (
                <div className={`p-5 border-l-4 rounded-r-lg animate-fade-in ${cardStyles[response.importancia]}`}>
                    <div className="flex items-center gap-2 mb-2 font-bold uppercase text-sm tracking-wider">
                        <span>Nivel de urgencia: {response.importancia}</span>
                    </div>
                    <p className="text-lg leading-relaxed italic">{response.message}</p>
                </div>
            )}

            {isLoading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
}