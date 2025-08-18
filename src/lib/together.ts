export async function generateStory(prompt: string) {
    const response = await fetch(process.env.TOGETHER_API_URL!, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
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

    if (!response.ok) {
        throw new Error(`Together API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No content generated.";
}
