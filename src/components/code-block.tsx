'use client';

// import { useState } from 'react';
// import { CodeIcon, LoaderIcon, PlayIcon, PythonIcon } from './icons';
// import { Button } from './ui/button';
// import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
// import { cn } from '~/lib/utils';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Button } from "./ui/button";
import { CopyIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

interface CodeBlockProps {
  node: never;
  inline: boolean;
  className: string;
  children: never;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  // const [output, setOutput] = useState<string | null>(null);
  // const [tabs, setTabs] = useState<string[]>(['code', 'run']);
  const tab = 'code';
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : 'text';

  const handleCopy = async () => {
    const text = String(children);
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!match) {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="not-prose flex flex-col my-4">
      <pre className="border border-zinc-200 dark:border-zinc-700 rounded-xl">
      <div className="flex items-center justify-between bg-muted px-4 py-0.5 rounded-t-xl border-b-0">
        <span className="text-xs font-medium text-muted-foreground">{language}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={handleCopy}
        >
          <CopyIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      {tab === 'code' && (
        // <pre
        //   {...props}
        //   className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
        // >
            <SyntaxHighlighter 
              language={match[1]} 
              customStyle={{
                backgroundColor: 'var(--code-bg)',
                color: 'var(--code-fg)',
                padding: '1rem',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius)',
                margin: 0,
              }}
              codeTagProps={{
                style: {
                  color: 'inherit', // Ensure code tags inherit the color
                }
              }}
              {...props}
            >
              {children}
            </SyntaxHighlighter>
        // </pre>
      )}

        {/* {tab === 'run' && output && (
          <div className="text-sm w-full overflow-x-auto bg-zinc-800 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 border-t-0 rounded-b-xl text-zinc-50">
            <code>{output}</code>
          </div>
        )} */}
        </pre>
      </div>
    );
  }
