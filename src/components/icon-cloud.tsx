import IconCloud from "@/components/magicui/icon-cloud";

const slugs = [
    "python",
    "typescript",
    "javascript",
    "cplusplus",
    "openai",
    "anthropic",
    "huggingface",
    "ollama",
    "pytorch",
    "tensorflow",
    "langchain",
    "react",
    "nextdotjs",
    "fastapi",
    "nodedotjs",
    "express",
    "postgresql",
    "mongodb",
    "mysql",
    "docker",
    "amazonaws",
    "microsoftazure",
    "nginx",
    "git",
    "github",
    "arduino",
    "raspberrypi",
    "tailwindcss",
    "vercel",
    "n8n",
];

export function IconCloudDemo() {
    return <IconCloud iconSlugs={slugs} />;
}
