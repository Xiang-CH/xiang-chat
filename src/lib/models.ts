export const MODELS = ["deepseek-r1", "deepseek-v3", "glm-4-flash"] as const;
export type Model = typeof MODELS[number];

export const MODEL_ICONS = ["deepseek", "zhipu", "openai", "groq"] as const;
export type ModelIcon = typeof MODEL_ICONS[number];

export const MODEL_PROVIDERS = ["baidu", "zhipu","openai", "groq"] as const;
export type ModelProvider = typeof MODEL_PROVIDERS[number];

const MODEL_DATA = {
    "deepseek-r1": {
        id: 0,
        name: "Deepseek R1",
        icon: "deepseek",
        model: "deepseek-r1",
        provider: "baidu"
    },
    "deepseek-v3": {
        id: 1,
        name: "Deepseek V3",
        icon: "deepseek",
        model: "deepseek-v3",
        provider: "baidu"
    },
    "glm-4-flash": {
        id: 2,
        name: 'GLM 4 Flash',
        icon: "zhipu",
        model: "glm-4-flash",
        provider: "zhipu"
    },
} as Record<Model, {id: number, name: string, icon: ModelIcon, model: Model, provider: ModelProvider}>;

export const getModelData = (model: Model) => MODEL_DATA[model] as {id: number, name: string, icon: ModelIcon, model: Model, provider: ModelProvider};