'use client';

// import { useState } from 'react';
// import { CodeIcon, LoaderIcon, PlayIcon, PythonIcon } from './icons';
// import { Button } from './ui/button';
// import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
// import { cn } from '~/lib/utils';

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
      {tab === 'code' && (
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
        >
          <code className="whitespace-pre-wrap break-words">{children}</code>
        </pre>
      )}

        {/* {tab === 'run' && output && (
          <div className="text-sm w-full overflow-x-auto bg-zinc-800 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 border-t-0 rounded-b-xl text-zinc-50">
            <code>{output}</code>
          </div>
        )} */}
      </div>
    );
  }
