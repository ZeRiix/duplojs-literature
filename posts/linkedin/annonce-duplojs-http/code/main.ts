import { createHub, routeStore } from "@duplojs/http";
import { createHttpServer } from "@duplojs/http/node";
import { codeGeneratorPlugin } from "@duplojs/http/codeGenerator";
import { openApiGeneratorPlugin } from "@duplojs/http/openApiGenerator";
import { envs } from "./env";

import "./routes";

const hub = createHub({ environment: "DEV" })
	.register(routeStore.getAll())
	.plug(
		codeGeneratorPlugin({ outputFile: "types.d.ts" }),
	)
	.plug(
		openApiGeneratorPlugin({ routePath: "/swagger-ui" }),
	);

await createHttpServer(
	hub,
	{
		host: envs.HOST,
		port: envs.PORT,
	},
)
	.then(
		() => void console.log(`${envs.APP_NAME} is running !`),
	);
