import { Configuration, OpenAIApi } from 'openai'

export type AIChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

function createOpenApiClient(): OpenAIApi {
  const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
  })

  return new OpenAIApi(configuration)
}

export default createOpenApiClient
