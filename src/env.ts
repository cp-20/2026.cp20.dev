import * as v from "valibot";

const envSchema = v.object({
  QIITA_ACCESS_TOKEN: v.string(),
  GHOST_API_KEY: v.string(),
});

export const parseEnv = (env: Record<string, unknown>) => {
  return v.parse(envSchema, env);
};

export type Env = ReturnType<typeof parseEnv> & { [key: string]: unknown };
