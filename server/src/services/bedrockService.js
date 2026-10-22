import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { config } from '../config.js';

let bedrockClient = null;

function getBedrockClient() {
  if (bedrockClient) return bedrockClient;

  if (config.aws.accessKeyId && config.aws.secretAccessKey) {
    try {
      bedrockClient = new BedrockRuntimeClient({
        region: config.aws.region,
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
      });
      console.log(`[AWS Bedrock] Client initialized for region: ${config.aws.region}`);
    } catch (err) {
      console.warn('[AWS Bedrock] Failed to initialize client:', err.message);
      bedrockClient = null;
    }
  } else {
    // Attempt default credential provider chain (e.g., IAM role on EC2/ECS/Lambda or ~/.aws/credentials)
    try {
      bedrockClient = new BedrockRuntimeClient({ region: config.aws.region });
      console.log(`[AWS Bedrock] Initialized with default credential provider chain in ${config.aws.region}`);
    } catch {
      bedrockClient = null;
    }
  }
  return bedrockClient;
}

export function isBedrockConfigured() {
  return !!(config.aws.accessKeyId && config.aws.secretAccessKey);
}

/**
 * Invoke Bedrock for academic text or quiz generation
 */
export async function invokeBedrock({
  prompt,
  systemPrompt = 'You are CampusPilot AI, an intelligent academic productivity assistant.',
  modelId = config.aws.bedrockModelId,
  maxTokens = 1000,
  temperature = 0.4,
}) {
  const client = getBedrockClient();

  if (client && isBedrockConfigured()) {
    try {
      const startTime = Date.now();
      let payload;

      // Handle Anthropic Claude format
      if (modelId.includes('anthropic.claude')) {
        payload = {
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: [{ type: 'text', text: prompt }],
            },
          ],
        };
      } else if (modelId.includes('amazon.titan')) {
        payload = {
          inputText: `${systemPrompt}\n\nHuman: ${prompt}\n\nAssistant:`,
          textGenerationConfig: {
            maxTokenCount: maxTokens,
            temperature,
            stopSequences: ['Human:'],
          },
        };
      } else {
        // Llama or default format
        payload = {
          prompt: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`,
          max_gen_len: maxTokens,
          temperature,
        };
      }

      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      });

      const response = await client.send(command);
      const latencyMs = Date.now() - startTime;
      const rawBody = new TextDecoder().decode(response.body);
      const parsed = JSON.parse(rawBody);

      let text = '';
      if (parsed.content && parsed.content[0]?.text) {
        text = parsed.content[0].text;
      } else if (parsed.results && parsed.results[0]?.outputText) {
        text = parsed.results[0].outputText;
      } else if (parsed.generation) {
        text = parsed.generation;
      } else {
        text = rawBody;
      }

      return {
        text,
        provider: `AWS Bedrock (${modelId})`,
        latencyMs,
        isLiveAWS: true,
      };
    } catch (err) {
      console.warn(`[AWS Bedrock] Live invocation failed (${err.message}). Using resilient academic generator fallback.`);
    }
  }

  // Graceful Fallback Engine
  return {
    text: null,
    provider: 'CampusPilot Academic Engine (AWS Bedrock Ready)',
    isLiveAWS: false,
    latencyMs: 12,
  };
}
