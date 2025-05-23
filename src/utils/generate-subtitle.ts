import axios from "axios";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generatePlayerSubtitle(playerName: string) {
  const prompt = `
You are a basketball scout. Based on general scouting reports, media buzz, and known tendencies, describe the play style of this player in 3–7 words.

Avoid generic phrases like "Versatile Prospect".

Player: ${playerName}

Examples:
- Cooper Flagg: "Elite Two-Way Forward with Motor"
- Jared McCain: "Smooth Shooter and Tough Defender"

Now respond only with the subtitle for:
${playerName}
`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4", // Or gpt-3.5-turbo if you don't have GPT-4 access
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 40,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );

  return response.data.choices[0].message.content.trim();
}
