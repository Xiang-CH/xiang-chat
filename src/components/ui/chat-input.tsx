"use client";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useTextareaResize } from "~/hooks/use-textarea-resize";
import { ArrowUpIcon } from "lucide-react";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface ChatInputContextValue {
	value?: string;
	onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
	onSubmit?: () => void;
	loading?: boolean;
	onStop?: () => void;
	variant?: "default" | "unstyled";
	showDictation?: boolean;
	setShowDictation?: (showDictation: boolean) => void;
	dictating?: boolean;
	setDictating?: (dictating: boolean) => void;
	rows?: number;
}

const ChatInputContext = createContext<ChatInputContextValue>({});

interface ChatInputProps extends Omit<ChatInputContextValue, "variant"> {
	children: React.ReactNode;
	className?: string;
	variant?: "default" | "unstyled";
	rows?: number;
}

function ChatInput({
	children,
	className,
	variant = "default",
	value,
	onChange,
	onSubmit,
	loading,
	onStop,
	rows = 1,
}: ChatInputProps) {
	const [showDictation, setShowDictation] = useState(true);
	const [dictating, setDictating] = useState(false);
	const contextValue: ChatInputContextValue = {
		value,
		onChange,
		onSubmit,
		loading,
		onStop,
		variant,
		rows,
		showDictation,
		setShowDictation,
		dictating,
		setDictating,
	};

	return (
		<ChatInputContext.Provider value={contextValue}>
			<div
				className={cn(
					variant === "default" &&
						"flex flex-col items-end w-full p-2 border border-input rounded-2xl bg-transparent focus-within:ring-1 focus-within:ring-ring focus-within:outline-none",
					variant === "unstyled" && "flex items-start gap-2 w-full",
					className,
				)}
			>
				{children}
			</div>
		</ChatInputContext.Provider>
	);
}

ChatInput.displayName = "ChatInput";

interface ChatInputTextAreaProps extends React.ComponentProps<typeof Textarea> {
	value?: string;
	onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
	onSubmit?: () => void;
	variant?: "default" | "unstyled";
}

function ChatInputTextArea({
	onSubmit: onSubmitProp,
	value: valueProp,
	onChange: onChangeProp,
	className,
	variant: variantProp,
	...props
}: ChatInputTextAreaProps) {
	const context = useContext(ChatInputContext);
	const value = valueProp ?? context.value ?? "";
	const onChange = onChangeProp ?? context.onChange;
	const onSubmit = onSubmitProp ?? context.onSubmit;
	const rows = context.rows ?? 1;
	const textareaRef = useTextareaResize(value, rows);

	useEffect(() => {
		if (context.dictating) {
			textareaRef.current?.focus();
		}
	}, [context.dictating]);

	// Convert parent variant to textarea variant unless explicitly overridden
	const variant =
		variantProp ?? (context.variant === "default" ? "unstyled" : "default");

	const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
		// Hide dictation when text is entered (including paste)
		if (e.target.value && context.showDictation && context.setShowDictation && !context.dictating) {
			context.setShowDictation(false);
		}
		// Call the original onChange handler
		onChange?.(e);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (!onSubmit) {
			return;
		}
		if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
			if (typeof value !== "string" || value.trim().length === 0) {
				return;
			}
			e.preventDefault();
			onSubmit();
		}
	};

	return (
		<Textarea
			ref={textareaRef}
			{...props}
			value={value}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			placeholder={context.dictating ? "Listening..." : props.placeholder}
			spellCheck={true}
			className={cn(
				"max-h-[400px] min-h-0 resize-none overflow-x-hidden",
				variant === "unstyled" &&
					"border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
				className,
			)}
			rows={rows}
		/>
	);
}
import { MicIcon, AudioLinesIcon } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

ChatInputTextArea.displayName = "ChatInputTextArea";

interface ChatInputSubmitProps extends React.ComponentProps<typeof Button> {
	onSubmit?: () => void;
	loading?: boolean;
	onStop?: () => void;
}

function ChatInputSubmit({
	onSubmit: onSubmitProp,
	loading: loadingProp,
	onStop: onStopProp,
	className,
	...props
}: ChatInputSubmitProps) {
	const context = useContext(ChatInputContext);
	const loading = loadingProp ?? context.loading;
	const onStop = onStopProp ?? context.onStop;
	const onSubmit = onSubmitProp ?? context.onSubmit;
	const {
		transcript,
		finalTranscript,
		listening,
		browserSupportsSpeechRecognition,
	  } = useSpeechRecognition();

	useEffect(() => {
		if (!context.setDictating) return;
		context.setDictating(listening);
	}, [listening]);

	useEffect(() => {
		if (!context.value?.trim() && context.setShowDictation) {
			context.setShowDictation(true);
		}
	}, [context.value]);

	useEffect(() => {
		context.onChange?.({ target: { value: transcript } } as React.ChangeEvent<HTMLTextAreaElement>);
	}, [transcript]);

	useEffect(() => {
		if (context.showDictation && finalTranscript) {
			void SpeechRecognition.stopListening()
				.then(() => {
					context.setShowDictation?.(false);
				})
				.catch((error) => {
					console.error("Error stopping speech recognition:", error);
				});
		}
	}, [finalTranscript]);


	if (context.showDictation && browserSupportsSpeechRecognition) {
		return (
			<Button
				onClick={() => {
					if (listening) {
						SpeechRecognition.stopListening()
						.then(() => {
							context.setDictating?.(false);
						})
						.catch(() => {
							context.setDictating?.(false);
						});
					} else {
						SpeechRecognition.startListening()
						.catch(() => {
							context.setShowDictation?.(false);
						});
					}
				}}
				className={cn(
					"shrink-0 rounded-full p-1.5 h-fit border dark:border-zinc-600",
					className,
				)}
				{...props}
			>
				{listening ? <AudioLinesIcon /> : loading ? <StopIcon /> : <MicIcon />}
			</Button>
		);
	}

	if (loading && onStop) {
		return (
			<Button
				onClick={onStop}
				className={cn(
					"shrink-0 rounded-full p-1.5 h-fit border dark:border-zinc-600",
					className,
				)}
				{...props}
			>
				<StopIcon />
			</Button>
		);
	}

	const isDisabled =
		typeof context.value !== "string" || context.value.trim().length === 0;

	return (
		<Button
			className={cn(
				"shrink-0 rounded-full p-1.5 h-fit border dark:border-zinc-600",
				className,
			)}
			disabled={isDisabled}
			type="submit"
			onClick={(event) => {
				event.preventDefault();
				if (!isDisabled) {
					onSubmit?.();
				}
			}}
			{...props}
		>
			<ArrowUpIcon />
		</Button>
	);
}

const StopIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="currentColor"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-label="Stop"
		role="img"
	>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
	</svg>
);

ChatInputSubmit.displayName = "ChatInputSubmit";

export { ChatInput, ChatInputTextArea, ChatInputSubmit };
