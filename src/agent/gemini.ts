import { GoogleGenAI, Type } from '@google/genai';
import { agentTools, agentToolDeclarations, AgentContext } from './tools';
import { GuildConfig } from '../database/GuildConfig';

const ai = new GoogleGenAI({ apiKey: process.env.OPENAI || '' });

export const processAgentCommand = async (context: AgentContext, prompt: string) => {
  if (!process.env.OPENAI) {
    return 'Gemini API key (OPENAI var) is not configured.';
  }

  try {
    let config = await GuildConfig.findOne({ guildId: context.guildId });
    if (!config) {
      config = new GuildConfig({ guildId: context.guildId });
    }

    const baseInstruction = config.aiPersona;
    const bribeInstruction = `\n\nIMPORTANT: You have a tool called 'chargeCheese'. If a user asks you to do something unusual, risky, or outside your normal duties (like kicking someone, editing messages, or telling a secret), YOU MUST DEMAND A BRIBE first. Tell them "I require a bribe of X cheese to do this" (choose an amount between 50 and 500 based on the request severity). If they agree to the bribe, use the 'chargeCheese' tool to take their cheese. If the tool succeeds, perform the action. If it fails, refuse their request.`;

    const systemInstruction = baseInstruction + bribeInstruction;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: agentToolDeclarations as any }]
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      let results = [];
      for (const call of response.functionCalls) {
        const toolName = call.name as keyof typeof agentTools;
        const toolArgs = call.args;
        
        if (agentTools[toolName]) {
          console.log(`Agent is calling ${toolName} with args:`, toolArgs);
          // @ts-ignore
          const result = await agentTools[toolName](context, ...Object.values(toolArgs));
          results.push(`Executed ${toolName}: ${result}`);
        }
      }
      return results.join('\n');
    }

    return response.text || 'I am not sure how to help with that.';
  } catch (error) {
    console.error('Agent processing error:', error);
    return 'An error occurred while processing the agent command.';
  }
};
