Une app serveur qui démarre avec une config invalide n’est pas prête à démarrer.

On parle souvent des env comme d’un détail, alors que c’est le socle de l’app: **PORT**, **URLs**, **credentials**, etc.

Pourquoi parser les env au démarrage ?
- **process.env** ne renvoie que des strings
- une valeur manquante/invalide doit bloquer le démarrage
- une erreur de config doit être visible tout de suite, au bon endroit

Et il y a un vrai bonus DX: **le pretty error**.
C’est plus simple de lire une erreur de parser qui dit clairement “telle variable manque” ou “telle valeur est invalide”, plutôt que de débugger un crash plus loin dans l’app.
Au final, ça enlève de la charge mentale.

C’est exactement ce que fait **environmentVariableOrThrow** dans **@duplojs/server-utils:**
- lecture des **`.env`**
- expansion des variables
- parsing/validation typée
- throw immédiat si la config est invalide

Et si vous préférez une approche monadique, la fonction existe aussi en version **`environmentVariable`**.

Ce n’est pas une révolution, mais une évolution très pratique: moins de bricolage, des erreurs lisibles, et un bootstrap serveur plus fiable.
Et comme toutes les fonctions de **@duplojs/server-utils**, cette méthode est **cross-platform**: **Node**, **Deno** et **Bun**.

Documentation: https://server-utils.duplojs.dev/fr/v0/api/common/environmentVariable

En coopération avec Mathieu Campani et DuploJS.

Ce post a été corrigé par une IA.

#TypeScript #NodeJS #Bun #Deno #API #DX #DeveloperExperience #OpenSource #TypeSafety #RobustCode #Env #Dotenv #DuploJS

---

```ts
import { DP } from "@duplojs/utils";
import { environmentVariableOrThrow } from "@duplojs/server-utils";

export const envs = await environmentVariableOrThrow(
	{
		APP_NAME: DP.string(),
		ENVIRONMENT: DP.literal(["DEV", "PROD"]),
		PORT: DP.coerce.number(),
		DATABASE_URL: DP.string(),
		ENABLE_METRICS: DP.coerce.boolean(),
	},
	{
		paths: [".env", ".env.local"],
		justRead: true,
	},
);

type check = ExpectType<
	typeof envs,
	{
		APP_NAME: string;
		ENVIRONMENT: "DEV" | "PROD";
		PORT: number;
		DATABASE_URL: string;
		ENABLE_METRICS: boolean;
	},
	"strict"
>;
```

before:
```ts
import * as zod from "zod";
import { config as importEnvFile } from "dotenv";
import { expand as expandEnv } from "dotenv-expand";
// ❌ Plusieurs dépendances externes juste pour gérer la config env

for (const pathEnv of [".env.local", ".env"]) {
  expandEnv(importEnvFile({ path: pathEnv })); // 🙂 Charge + expand des fichiers
}

export const envs = zod
  .object({
    APP_NAME: zod.string(),
    ENVIRONMENT: zod.enum(["DEV", "PROD"]),
    PORT: zod.coerce.number(),
    DATABASE_URL: zod.string(),
    ENABLE_METRICS: zod.coerce.boolean(),
  })
  .parse(process.env); // ⚠️ Si ça casse, tu dois relier plusieurs libs dans le debug
```

after:
```ts
import { DP } from "@duplojs/utils";
import { environmentVariableOrThrow } from "@duplojs/server-utils";

export const envs = await environmentVariableOrThrow(
  {
    APP_NAME: DP.string(),
    ENVIRONMENT: DP.literal(["DEV", "PROD"]),
    PORT: DP.coerce.number(),
    DATABASE_URL: DP.string(),
    ENABLE_METRICS: DP.coerce.boolean(),
  },
  {
    paths: [".env", ".env.local"],
    justRead: true,
  },
); // ✅ Lecture + expansion + parsing typé au même endroit
   // ✅ Pretty errors plus lisibles au démarrage
   // ✅ Cross-platform: Node, Deno, Bun
```
