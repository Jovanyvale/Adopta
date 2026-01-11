import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { input } = await req.json();

    if (!input || typeof input !== "string") {
        return NextResponse.json(
            { error: "Input inválido" },
            { status: 400 }
        );
    }

    const systemPrompt = 'You are a professional veterinary assistant. Respond to the users pet symptoms with a clear answer in 40 words or less.If you are unsure of the issue or if it requires medical attention, recommend visiting a veterinarian.Respond only in valid JSON format and do not add any additional text. Follow the next format: { "importancia": "okay" | "warning" | "danger", "message": "string" } '

    const finalPrompt = `${systemPrompt}, User: ${input}`;

    const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: finalPrompt,
                parameters: {
                    max_new_tokens: 110,
                    temperature: 0.4,
                },
            }),
        }
    );

    const data = await response.json();

    return NextResponse.json({
        text: data[0]?.generated_text ?? "No response",
    });
}