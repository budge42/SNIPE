import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,  // Ensure this environment variable is correctly set in Vercel
});
const openai = new OpenAIApi(configuration);

async function generateUserStories(question, content) {
    const prompt = `
    You are a ServiceNow CSM implementation expert. Based on the following client input, generate detailed user stories and acceptance criteria:

    - ${question}: ${content}

    Generate user stories in this format:
    - User Story 1:
      - Description: [Story description]
      - Acceptance Criteria:
        - [Criteria 1]
        - [Criteria 2]

    Create at least 2 user stories with detailed acceptance criteria.`;

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4-turbo",  // Using gpt-4-turbo for faster responses
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.7,
        });

        return completion.data.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API error:", error.response ? error.response.data : error.message);
        throw new Error("Error generating user stories.");
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { goal, teams, issues, integration, question } = req.body;

        try {
            let generatedStories = "";
            if (question === 'goal') {
                generatedStories = await generateUserStories("Goal of CSM implementation", goal);
            } else if (question === 'teams') {
                generatedStories = await generateUserStories("Departments or teams using CSM", teams);
            } else if (question === 'issues') {
                generatedStories = await generateUserStories("Common customer issues or requests", issues);
            } else if (question === 'integration') {
                generatedStories = await generateUserStories("Integration requirements", integration);
            }

            res.status(200).json({ stories: generatedStories });
        } catch (error) {
            res.status(500).json({ error: "Error generating stories." });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
