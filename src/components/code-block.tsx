'use client';

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
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
    <div className="not-prose flex flex-col my-4 w-full max-w-full">
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl w-full max-w-full">
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
          <SyntaxHighlighter
            language={match[1]}
            style={tomorrow}
            customStyle={{
              backgroundColor: 'var(--code-bg)',
              color: 'var(--code-fg)',
              padding: '1rem',
              fontSize: '0.9rem',
              borderRadius: 'var(--radius)',
              margin: 0,
              width: '100%',
              maxWidth: '100%',
              overflow: 'auto',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              display: 'block',
            }}
            codeTagProps={{
              style: {
                color: 'inherit',
                display: 'inline-block',
                minWidth: '100%',
              }
            }}
            {...props}
          >
            {children}
          </SyntaxHighlighter>
          // <pre>
          //   <code className="text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md">
          //     {children}
          //   </code>
          // </pre>
        )}
      </div>
    </div>
  );
}
