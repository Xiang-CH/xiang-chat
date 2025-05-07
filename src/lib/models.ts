import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createZhipu } from 'zhipu-ai-provider';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { type LanguageModelV1, extractReasoningMiddleware, wrapLanguageModel } from 'ai';
import { config } from "dotenv";

config({ path: ".env" });

export const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "openrouter/deepseek-v3", "groq/qwen-qwq-32b", "groq/deepseek-r1-distill-qwen-32b", "openrouter/deepseek-r1-llama-70b",  "qwen2.5-vl-72b", "glm-4-plus", "gemini-2.5-pro", "glm-4-flash", "groq/llama-3.1-8b"] as const;
export type Model = typeof MODELS[number];
export const DEFAULT_MODEL = MODELS[0];

export const MODEL_ICONS = ["deepseek", "zhipu", "openai", "groq", "qwen", "gemini", "meta"] as const;
export type ModelIcon = typeof MODEL_ICONS[number];

const MODEL_PROVIDERS = {
    "zhipu": createZhipu({
        apiKey: process.env.ZHIPU_API_KEY,
    }),
    "openai": createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    }),
    "aliyun": createDeepSeek({
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        apiKey: process.env.DASHSCOPE_API_KEY,
    }),
    "openrouter": createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
        extraBody: {
            "include_reasoning": true,
        }
    }),
    "groq": createGroq({
        apiKey: process.env.GROQ_API_KEY,
    }),
    "google": createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    }),
}; 
type ProviderName = keyof typeof MODEL_PROVIDERS;

export type Provider = ReturnType<typeof createOpenAI> | ReturnType<typeof createDeepSeek> | ReturnType<typeof createOpenRouter> | ReturnType<typeof createGroq> | ReturnType<typeof createGoogleGenerativeAI>;

export const MODEL_DATA = {
   "groq/qwen-qwq-32b": {
        id: "groq/qwen-qwq-32b",
        name: "Qwen QwQ",
        icon: "qwen",
        model: wrapLanguageModel({
            model: MODEL_PROVIDERS.groq("qwen-qwq-32b"),
            middleware: extractReasoningMiddleware({
                tagName: "think"
            }),
          }),
        provider: "groq",
        isReasoning: true,
    },
    "openrouter/deepseek-v3": {
        id: "openrouter/deepseek-v3",
        name: "Deepseek V3",
        icon: "deepseek",
        model: MODEL_PROVIDERS.openrouter("deepseek/deepseek-chat-v3-0324:free"),
        provider: "openrouter",
        isReasoning: false,
    },
    "glm-4-plus": {
        id: "glm-4-plus",
        name: 'GLM 4 Plus',
        icon: "zhipu",
        model: MODEL_PROVIDERS.zhipu("glm-4-plus"),
        provider: "zhipu",
    },
    "groq/deepseek-r1-distill-qwen-32b": {
        id: "groq/deepseek-r1-distill-qwen-32b",
        name: "Deepseek R1 distill Qwen",
        icon: "deepseek",
        model: wrapLanguageModel({
            model: MODEL_PROVIDERS.groq("deepseek-r1-distill-qwen-32b"),
            middleware: extractReasoningMiddleware({
                tagName: "think"
            }),
          }),
        provider: "groq",
        isReasoning: true,
    },
    "groq/llama-3.1-8b": {
        id: "groq/llama-3.1-8b",
        name: "Llama 3.1 8b",
        icon: "meta",
        model: MODEL_PROVIDERS.groq("llama-3.1-8b-instant"),
        provider: "groq",
    },
    "gemini-2.0-flash": {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        icon: "gemini",
        model: MODEL_PROVIDERS.google("gemini-2.0-flash"),
        provider: "google",
    },
    "gemini-2.5-flash": {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        icon: "gemini",
        model: MODEL_PROVIDERS.google("gemini-2.5-flash-preview-04-17"),
        provider: "google",
    },
    "gemini-2.5-pro": {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        icon: "gemini",
        model: MODEL_PROVIDERS.google("gemini-2.5-pro-exp-03-25"),
        provider: "google",
        isReasoning: true,
    },
    "openrouter/deepseek-r1-llama-70b": {
        id: "openrouter/deepseek-r1-llama-70b",
        name: "Deepseek R1 distill llama",
        icon: "deepseek",
        model: MODEL_PROVIDERS.openrouter("deepseek/deepseek-r1-distill-llama-70b:free"),
        provider: "openrouter",
        isReasoning: true,
        // disabled: true,
    },
    "glm-4-flash": {
        id: "glm-4-flash",
        name: 'GLM 4 Flash',
        icon: "zhipu",
        model: MODEL_PROVIDERS.zhipu("glm-4-flash"),
        provider: "zhipu",
    },
    "qwen2.5-vl-72b": {
        id: "qwen2.5-vl-72b",
        name: 'Qwen 2.5 VL 72b',
        icon: "qwen",
        model: MODEL_PROVIDERS.openrouter("qwen/qwen2.5-vl-72b-instruct:free"),
        provider: "openrouter",
        isVision: true,
    }
 } as Record<Model, {id: Model, name: string, icon: ModelIcon, model: LanguageModelV1, provider: ProviderName, disabled?: boolean, isReasoning?: boolean, isVision?:boolean}>;