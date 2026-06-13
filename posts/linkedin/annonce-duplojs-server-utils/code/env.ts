import { environmentVariableOrThrow } from "@duplojs/server-utils";
import { DPE } from "@duplojs/utils";

const envResult = await environmentVariableOrThrow(
	{
		APP_NAME: DPE.string(),
		PORT: DPE.coerce.number(),
	},
	{
		paths: [".env", ".env.local"],
		override: true,
		justRead: true,
	},
);

envResult;
// ^?
