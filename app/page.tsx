"use client";

import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { useChat } from "@ai-sdk/react";
import { defaultChatStore } from "ai";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    chatStore: defaultChatStore({
      api: "/api/chat",
    }),
  });

  const [containerRef, endRef] = useScrollToBottom();

  if (error) return <div>{error.message}</div>;

  return (
    <div className="flex flex-col w-full h-dvh py-8 stretch">
      <div className="space-y-4 flex-grow overflow-y-auto" ref={containerRef}>
        {messages.map((m) => {
          return (
            <div key={m.id} className="max-w-xl mx-auto">
              <div className="font-bold">{m.role}</div>
              <div className="space-y-4">
                {m.parts.map((p, i) => {
                  switch (p.type) {
                    case "text":
                      return (
                        <div key={i} className="whitespace-pre-wrap">
                          <div>
                            <p>{p.text}</p>
                          </div>
                        </div>
                      );
                    case "tool-invocation":
                      const { toolName, state } = p.toolInvocation;

                      if (toolName === "getWeather" && state === "result") {
                        const { result } = p.toolInvocation;
                        return (
                          <div key={i} className="whitespace-pre-wrap">
                            <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-xl font-light">
                                    {result.city}
                                  </p>
                                  <p className="text-4xl font-semibold mt-1">
                                    {result.temperature}°
                                  </p>
                                </div>
                                <div>
                                  {result.weatherCode < 800 ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-12 w-12"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M5.5 16a3.5 3.5 0 01-.59-6.95 5.002 5.002 0 019.18-1A3.5 3.5 0 0118 13.5V16H5.5z" />
                                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6z" />
                                    </svg>
                                  ) : result.temperature > 25 ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-12 w-12"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <circle
                                        cx="10"
                                        cy="10"
                                        r="5"
                                        fill="yellow"
                                      />
                                      <path
                                        fillRule="evenodd"
                                        d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-12 w-12"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M5.5 10a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
                                      <path
                                        fillRule="evenodd"
                                        d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm-8 6.5a8 8 0 1116 0 8 8 0 01-16 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between mt-4 text-sm">
                                <div>
                                  <span className="font-medium">Humidity:</span>{" "}
                                  {result.humidity}%
                                </div>
                                <div>
                                  <span className="font-medium">Code:</span>{" "}
                                  {result.weatherCode}
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-right">
                                Updated just now
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={i} className="whitespace-pre-wrap">
                          <div className="font-mono">
                            <p>TOOL: {p.toolInvocation.toolName}</p>
                          </div>
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          );
        })}
        <div ref={endRef} className="h-2" />
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
        <input
          className="w-full p-2 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
