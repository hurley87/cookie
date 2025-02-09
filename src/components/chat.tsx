'use client';

import { useState } from 'react';
import { Message, continueConversation } from '@/app/actions';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Chat() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    console.log('handleSendMessage called', { input: input.trim(), isLoading });
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const userMessage: Message = {
        role: 'user' as const,
        content: input.trim(),
      };

      // Update conversation immediately with user message
      const updatedConversation = [...conversation, userMessage];
      setConversation(updatedConversation);
      setInput('');

      console.log('Calling continueConversation');
      const stream = await continueConversation(updatedConversation);
      console.log('Got response from continueConversation');

      let textContent = '';
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
      };

      // Add empty assistant message immediately
      setConversation([...updatedConversation, assistantMessage]);

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textContent += decoder.decode(value);
          setConversation([
            ...updatedConversation,
            { ...assistantMessage, content: textContent },
          ]);
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error in conversation
      setConversation([
        ...conversation,
        {
          role: 'assistant',
          content:
            'Sorry, there was an error processing your message. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'assistant' ? 'bg-gray-800' : ''
            } p-4 rounded-lg`}
          >
            <div className="flex-1">
              <div className="font-semibold mb-1 text-sm">
                {message.role === 'assistant' ? 'AI Assistant' : 'You'}
              </div>
              <div className="text-gray-200 whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat input */}
      <div className="border-t border-gray-800 p-4">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Message the AI..."
            className="w-full p-4 pr-24 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-600 text-white"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  handleSendMessage();
                }
              }
            }}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              console.log('Button clicked', { input: input.trim(), isLoading });
              handleSendMessage();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
