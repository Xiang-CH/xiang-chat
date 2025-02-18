import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { customProvider, type LanguageModelV1 } from 'ai';
import { config } from "dotenv";

config({ path: ".env" });

export const MODELS = ["aliyun/deepseek-r1-llama-70b", "openrouter/deepseek-r1-llama-70b", "glm-4-flash", "qwen2.5-vl-72b"] as const;
export type Model = typeof MODELS[number];
export const DEFAULT_MODEL = MODELS[0];

export const MODEL_ICONS = ["deepseek", "zhipu", "openai", "groq", "qwen"] as const;
export type ModelIcon = typeof MODEL_ICONS[number];

const MODEL_PROVIDERS = {
    "zhipu": createOpenAI({
        baseURL: "https://open.bigmodel.cn/api/paas/v4/",
        apiKey: process.env.ZHIPU_API_KEY,
    }),
    // openai: createOpenAI({
    //     apiKey: process.env.OPENAI_API_KEY,
    // }),
    "aliyun": createDeepSeek({
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        apiKey: process.env.DASHSCOPE_API_KEY,
    }),
    "openrouter": createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
    })
}; 
type ProviderName = keyof typeof MODEL_PROVIDERS;

export type Provider = ReturnType<typeof createOpenAI> | ReturnType<typeof createDeepSeek> | ReturnType<typeof createOpenRouter>;

export const MODEL_DATA = [
    {
        id: "aliyun/deepseek-r1-llama-70b",
        name: "Deepseek R1 llama 70b",
        icon: "deepseek",
        model: MODEL_PROVIDERS["aliyun"]("deepseek-r1-distill-llama-70b"),
        provider: "aliyun",
    },
    {
        id: "openrouter/deepseek-r1-llama-70b",
        name: "Deepseek R1 llama 70b",
        icon: "deepseek",
        model: MODEL_PROVIDERS["openrouter"]("deepseek/deepseek-r1-distill-llama-70b:free"),
        provider: "openrouter",
    },
    {
        id: "glm-4-flash",
        name: 'GLM 4 Flash',
        icon: "zhipu",
        model: MODEL_PROVIDERS["zhipu"]("glm-4-flash"),
        provider: "zhipu",
    },
    {
        id: "qwen2.5-vl-72b",
        name: 'Qwen 2.5 VL 72b',
        icon: "qwen",
        model: MODEL_PROVIDERS["openrouter"]("qwen/qwen2.5-vl-72b-instruct:free"),
        provider: "openrouter",
    }
] as {id: Model, name: string, icon: ModelIcon, model: LanguageModelV1, provider: ProviderName, disabled?: boolean}[];


export const myProvider = customProvider({
    languageModels: Object.fromEntries(MODEL_DATA.map(item => [item.id, item.model])),
})
