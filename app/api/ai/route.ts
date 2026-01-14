import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { input } = await req.json();

        const API_URL = "https://router.huggingface.co/v1/chat/completions";

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "Qwen/Qwen2.5-7B-Instruct",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional veterinary assistant. Respond ONLY with a JSON object: { \"importance\": \"none\"|\"okay\"|\"warning\"|\"danger\", \"message\": \"string\" } use none if the prompt is not for veterinary assistance and respond with something like 'Im here only for veterinary helping', do not talk with the user if the topic is not about animal veterinary. Give a definitive answer in 100 words or less; do not expect for the user to respond or provide more information."
                    },
                    { role: "user", content: input }
                ],
                max_tokens: 190,
                temperature: 0.1
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error de la API:", errorText);
            return NextResponse.json({ error: `IA fuera de servicio (${response.status})` }, { status: response.status });
        }

        const data = await response.json();

        // El formato de respuesta de /chat/completions esChoices -> Message -> Content
        const resultText = data.choices[0].message.content;

        return NextResponse.json({ response: resultText });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error Interno:", error.message);
        return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
    }
}