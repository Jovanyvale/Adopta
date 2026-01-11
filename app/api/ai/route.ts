import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { input } = await req.json();

        // El endpoint de CHAT es el más estable para el Router
        const API_URL = "https://router.huggingface.co/v1/chat/completions";

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // Qwen es el modelo con mejor disponibilidad en el router gratuito actualmente
                model: "Qwen/Qwen2.5-7B-Instruct",
                messages: [
                    {
                        role: "system",
                        content: "You are a vet assistant. Respond ONLY with a JSON object: { \"importancia\": \"okay\"|\"warning\"|\"danger\", \"message\": \"string\" }"
                    },
                    { role: "user", content: input }
                ],
                max_tokens: 150,
                temperature: 0.1
            }),
        });

        // Verificamos si la respuesta es OK antes de intentar leer JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error de la API:", errorText);
            return NextResponse.json({ error: `IA fuera de servicio (${response.status})` }, { status: response.status });
        }

        const data = await response.json();

        // El formato de respuesta de /chat/completions esChoices -> Message -> Content
        const resultText = data.choices[0].message.content;

        return NextResponse.json({ response: resultText });

    } catch (error: any) {
        console.error("Error Interno:", error.message);
        return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
    }
}