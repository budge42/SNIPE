const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Store the OpenAI API key in environment variables
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { goal, teams, issues, integration } = req.body;

        const prompt = `
        You are a ServiceNow CSM implementation expert. Based on the following client inputs, generate detailed user stories and acceptance criteria.

        - Goal of CSM implementation: ${goal}
        - Departments or teams using CSM: ${teams}
        - Common customer issues or requests: ${issues}
        - Integration requirements: ${integration}

        Generate user stories in this format:
        - User Story 1:
          - Description: [Story description]
          - Acceptance Criteria:
            - [Criteria 1]
            - [Criteria 2]

        Create at least 3 user stories with detailed acceptance criteria.`;

        try {
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 500,
            });

            const generatedText = completion.data.choices[0].text;

            res.status(200).json({ stories: generatedText });
        } catch (error) {
            res.status(500).json({ error: "Error generating stories." });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
