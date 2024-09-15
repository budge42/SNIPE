const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this environment variable is correctly set in Vercel
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
            // Log request details for debugging
            console.log("Received request:", req.body);
            
            const completion = await openai.createChatCompletion({
                model: "gpt-4", // Ensure you have access to this model
                messages: [
                    { role: "system", content: "You are a ServiceNow CSM implementation expert." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 5000,
                temperature: 0.7,
            });

            const generatedText = completion.data.choices[0].message.content;

            // Log successful completion for debugging
            console.log("Generated stories:", generatedText);

            res.status(200).json({ stories: generatedText });
        } catch (error) {
            // Log detailed error info for debugging
            console.error('OpenAI API error:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: error.response ? error.response.data : 'Error generating stories.' });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
