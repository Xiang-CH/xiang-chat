import React from 'react';
import { Button } from "~/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { type GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';

// Define a more specific type for individual grounding chunks based on the SDK type
// Revert to the original definition to type GroundingChunk as a single chunk object
type GroundingChunk = NonNullable<GoogleGenerativeAIProviderMetadata["groundingMetadata"]>["groundingChunks"];

interface GroundingSourcesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sources: GroundingChunk | undefined | null;
  googleSearchRender?: string;
}

export const GroundingSourcesPanel: React.FC<GroundingSourcesPanelProps> = ({
  isOpen,
  onClose,
  sources,
  googleSearchRender
}) => {
  // Panel is not rendered if not open or no sources
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-background shadow-xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="sources-panel-title"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h2 id="sources-panel-title" className="text-lg font-semibold">
            Sources
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sources panel">
            <Cross2Icon className="h-5 w-5" />
          </Button>
        </div>
        <div dangerouslySetInnerHTML={{ __html: googleSearchRender ?? '' }}></div>
        <div className="flex-grow overflow-y-auto p-4">
          {!sources || sources.length === 0 ? (
            <p className="text-muted-foreground">No sources available for this message.</p>
          ) : (
            <ul className="space-y-3">
              {sources.map((chunk, index) => chunk && (
                <li key={index} className="rounded-md border p-3">
                  {chunk.web ? (
                    <>
                      <h3 className="mb-1 text-sm font-semibold">
                        {chunk.web.title || 'Untitled Source'}
                      </h3>
                      <a
                        href={chunk.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {chunk.web.uri}
                      </a>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Source data format not recognized</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}; 