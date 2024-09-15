import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,  // Ensure this environment variable is correctly set in Vercel
});
const openai = new OpenAIApi(configuration);

async function generateCohesiveUserStories(goal, teams, issues, integration) {
    const prompt = `
    You are a ServiceNow CSM implementation expert. Based on the following inputs, generate detailed, cohesive user stories and acceptance criteria for a Customer Service Management project:

    - Goal of CSM implementation: ${goal}
    - Departments or teams using CSM: ${teams}
    - Common customer issues or requests: ${issues}
    - Integration requirements: ${integration}

    Generate user stories that account for the full project scope, with each user story having:
    - Description
    - Acceptance Criteria (at least 2 per story)

    Create a cohesive plan of at least 4 user stories based on this input.`;

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
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
        const { goal, teams, issues, integration } = req.body;

        try {
            const generatedStories = await generateCohesiveUserStories(goal, teams, issues, integration);
            res.status(200).json({ stories: generatedStories });
        } catch (error) {
            res.status(500).json({ error: "Error generating stories." });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
