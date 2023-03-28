export default () => ({
  auth: {
    chatgptToken: process.env.CHATGPT_TOKEN,
  },
  database: {
    pinecone: {
      environment: process.env.PINECONE_ENVIRONMENT,
      apiKey: process.env.PINECONE_API_KEY,
      index: process.env.PINECONE_INDEX,
    },
  },
  openai: {
    organization: process.env.OPEN_AI_ORGANIZATION,
    apiKey: process.env.OPEN_AI_KEY,
  },
});
