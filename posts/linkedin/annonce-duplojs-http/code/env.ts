import { environmentVariableOrThrow } from "@duplojs/server-utils";
import { DPE } from "@duplojs/utils";

export const envs = await environmentVariableOrThrow(
	{
		APP_NAME: DPE.string(),
		PORT: DPE.coerce.number(),
		TOKEN_SECRET: DPE.string(),
		HOST: DPE.literal(["127.0.0.1", "localhost", "0.0.0.0"]),
	},
	{
		paths: [".env", ".env.local"],
		override: true,
		justRead: true,
	},
);
