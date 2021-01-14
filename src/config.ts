import { WriteConfig } from "@theoparis/config";
import * as z from "zod";

export const configSchema = z.object({
    PTERO_URI: z.string().url(),
    PREFIX: z.string().default("-"),
    TOKEN: z.string(),
    PTERO_KEY: z.string().nonempty(),
    NODE_ENV: z.union([z.literal("dev"), z.literal("prod")]),
});
export type Config = z.infer<typeof configSchema>;

export const config = new WriteConfig<Config>(
    (process.env as unknown) as Config,
    { type: "yaml", schema: configSchema }
);

export default config;
