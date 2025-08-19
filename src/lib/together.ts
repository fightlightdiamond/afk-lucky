interface TogetherAPIMessage {
    content?: string;
}

interface TogetherAPIChoice {
    message?: TogetherAPIMessage;
}

interface TogetherAPIResponse {
    choices?: TogetherAPIChoice[];
}

export async function generateStory(prompt: string) {
    const apiUrl = process.env.TOGETHER_API_URL;
    const apiKey = process.env.TOGETHER_API_KEY;

    if (!apiUrl) {
        throw new Error("Missing TOGETHER_API_URL environment variable");
    }

    if (!apiKey) {
        throw new Error("Missing TOGETHER_API_KEY environment variable");
    }

    let response: Response;

    try {
        response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            }),
        });
    } catch (error) {
        throw new Error(
            `Network error while calling Together API: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }

    if (!response.ok) {
        throw new Error(`Together API error: ${response.status} ${response.statusText}`);
    }

    let data: TogetherAPIResponse;
    try {
        data = (await response.json()) as TogetherAPIResponse;
    } catch (error) {
        throw new Error(
            `Error parsing Together API response: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }

    return data.choices?.[0]?.message?.content || "No content generated.";
}
