import { z } from "zod";

export type ToolDef<T> = {
    name: string;
    description: string;
    schema: z.ZodType<T>;
    impl: (args: T) => Promise<unknown>;
};

// time.now
const TimeNowArgs = z.object({});
async function timeNow(_: z.infer<typeof TimeNowArgs>) {
    return { iso: new Date().toISOString() };
}

// text.uppercase
const UpperArgs = z.object({ text: z.string().min(1) });
async function textUpper(args: z.infer<typeof UpperArgs>) {
    return { value: args.text.toUpperCase() };
}

export const TOOL_REGISTRY = [
    {
        name: "time.now",
        description: "Get the current timestamp in ISO 8601.",
        schema: TimeNowArgs,
        impl: timeNow,
    },
    {
        name: "text.uppercase",
        description: "Return the uppercase version of the given text.",
        schema: UpperArgs,
        impl: textUpper,
    },
] as const;

export type ToolName = typeof TOOL_REGISTRY[number]["name"];
