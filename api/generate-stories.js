import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Make sure your OpenAI API key is set in Vercel
});
const openai = new OpenAIApi(configuration);

// Helper function for generating user stories for each question
async function generateUserStory(question, content) {
    const prompt = `
    You are a ServiceNow CSM implementation expert. Based on the following input, generate detailed user stories and acceptance criteria:

    - ${question}: ${content}

    Create at least 2 user stories with detailed acceptance criteria.
    `;

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4-turbo", // Ensure you're using gpt-4-turbo for faster performance
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500, // You can adjust this based on your needs
            temperature: 0.7,
        });

        return completion.data.choices[0].message.content;
    } catch (error) {
        throw new Error(`Error generating user stories for ${question}: ${error.message}`);
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { goal, teams, issues, integration } = req.body;

        try {
            // Run the API requests in parallel
            const [goalStories, teamsStories, issuesStories, integrationStories] = await Promise.all([
                generateUserStory('Goal of CSM implementation', goal),
                generateUserStory('Departments or teams using CSM', teams),
                generateUserStory('Common customer issues or requests', issues),
                generateUserStory('Integration requirements', integration),
            ]);

            // Combine all the stories into a single response
            const allStories = `
                Goal Stories:\n${goalStories}\n
                Teams Stories:\n${teamsStories}\n
                Issues Stories:\n${issuesStories}\n
                Integration Stories:\n${integrationStories}
            `;

            res.status(200).json({ stories: allStories });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
