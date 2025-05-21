import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  hasToolCall,
  maxSteps,
  smoothStream,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log(JSON.stringify(convertToModelMessages(messages), null, 2));

  const stream = createUIMessageStream({
    execute: (writer) => {
      const result = streamText({
        model: openai("gpt-4.1-mini"),
        messages: convertToModelMessages(messages),
        continueUntil: maxSteps(3),
        tools: {
          getWeather: tool({
            description: "Get the current weather at a location",
            parameters: z.object({
              latitude: z.number(),
              longitude: z.number(),
              city: z.string(),
            }),
            execute: async ({ latitude, longitude, city }) => {
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,relativehumidity_2m&timezone=auto`,
              );

              const weatherData = await response.json();
              return {
                temperature: weatherData.current.temperature_2m,
                weatherCode: weatherData.current.weathercode,
                humidity: weatherData.current.relativehumidity_2m,
                city,
              };
            },
          }),
          generateCode: tool({
            description: "Generate code based on requirements",
            parameters: z.object({ repo: z.string() }),
            execute: async ({ repo }) => {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              return "Generated 3 files for " + repo;
            },
          }),
          createPR: tool({
            description: "Create a pull request with generated code",
            parameters: z.object({
              branch: z.string(),
            }),
            execute: async ({ branch }) => {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              return "Created a PR for " + branch;
            },
          }),
        },
      });
      writer.merge(
        result.toUIMessageStream({
          onError: (error) => {
            if (error instanceof Error) {
              return error.message;
            }
            console.error(error);
            return "An unknown error occurred.";
          },
        }),
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}
