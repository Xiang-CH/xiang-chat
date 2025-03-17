"use client";

import { useState, useCallback, memo } from "react";
import { ChevronDownIcon, LoaderIcon } from "./icons";
import { motion, AnimatePresence } from "framer-motion";
import { Markdown } from "./markdown";

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

// Memoize the component to prevent unnecessary re-renders
export const MessageReasoning = memo(function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "0.5rem",
    },
  };

  return (
    <div className="flex flex-col pb-2">
      <div className="flex flex-row items-center gap-2">
        <div
          className={
            "font-medium" +
            (isExpanded ? "" : " text-zinc-600 dark:text-zinc-400")
          }
        >
          Reasoning
        </div>
        {isLoading && (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        )}
        <div
          className={
            "cursor-pointer transition-all" +
            (!isExpanded ? " text-zinc-600 dark:text-zinc-400" : " rotate-180")
          }
          onClick={toggleExpanded}
        >
          <ChevronDownIcon />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="flex flex-col gap-4 border-l pl-4 text-zinc-600 dark:text-zinc-400"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
