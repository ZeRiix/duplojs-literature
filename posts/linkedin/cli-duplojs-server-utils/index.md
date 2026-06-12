Vous pouvez commencer à ranger vos vieilles libs de CLI.

Pas parce que le monde avait absolument besoin d’une énième lib de commande.
Mais parce que **@duplojs/server-utils** a maintenant son propre système de commandes au standard **DuploJS**.

Et franchement, quand on a déjà utilisé des libs comme **commander**, **mri** et compagnie, il était nécessaire de remettre le sujet sur la table.

Ici, la promesse n’est pas de réinventer la roue.
La promesse, c’est surtout d’avoir une roue plus cohérente, plus typée, et plus agréable à composer :
→ des **options/sujet parsées nativement avec les DataParsers**
→ la possibilité de construire une **simple commande** ou un **CLI complet**
→ une DX pensée comme un **arbre de commandes descendant**
→ un système de **documentation automatique** (**`--help` généré**)

Autrement dit :
tu ne déclares pas juste des flags et des strings.
Tu décris une commande avec ses options, ses sous-commandes, ses arguments, et leur parsing typé directement au même endroit.

Le point vraiment satisfaisant, pour moi, c’est l’intégration des **DataParsers**.
Une option peut parser une string, une literal union, un tableau, ou une structure plus complexe.

Petit bonus non négociable : c’est **cross-platform**.
La même API tourne sur **Node**, **Deno** et **Bun**.

Brefff, une petite lib de commande, pas là pour faire du bruit, mais largement capable de remplacer pas mal de bricolage existant.

Documentation: https://server-utils.duplojs.dev/fr/v0/api/command/

En coopération avec Mathieu Campani et DuploJS.

Ce post a été corrigé par une IA.

#TypeScript #NodeJS #Bun #Deno #CLI #DX #DeveloperExperience #OpenSource #TypeSafety #DuploJS #Tooling

---



```ts
import { SC } from "@duplojs/server-utils";
import { DP } from "@duplojs/utils";

// command definition
await SC.exec(
	{
		description: "Resize an image",
		options: [
			SC.createOption("width", DP.coerce.number(), {
				required: true,
			}),
			SC.createOption("height", DP.coerce.number()),
			SC.createOption(
				"format",
				DP.literal(["webp", "png", "jpeg"]),
			),
		],
		subject: DP.string(),
	},
	({ options, subject: filePath }) => {
		type check = ExpectType<
			typeof options,
			{
				width: number;
				height: number | undefined;
				format: "webp" | "png" | "jpeg" | undefined;
			},
			"strict"
		>;
	},
);
// try with: tsx resize-cli.ts ./image/path.png --width=500 --format=jpeg
```

```ts
import { SC } from "@duplojs/server-utils";
import { DP } from "@duplojs/utils";

const userCommand = SC.create(
	"users",
	{
		description: "Generate user fixtures",
		options: [
			SC.createOption(
				"count",
				DP.coerce.number(),
				{
					aliases: ["c", "C"],
					required: true,
				},
			),
			SC.createOption(
				"role",
				DP.literal(["admin", "editor", "user"]),
			),
			SC.createBooleanOption("verified"),
		],
	},
	({ options }) => {
		// ^?
		type check = ExpectType<
			typeof options,
			{
				count: number;
				role: "admin" | "editor" | "user" | undefined;
				verified: boolean;
			},
			"strict"
		>;
	},
);

/**
 * ...others subCommands
 */

await SC.exec(
	{
		description: "Fixture CLI",
		// register subCommand
		subject: [userCommand, postCommand, postCommand, stockCommand],
	},
	() => {},
);
// try with: tsx fixture-cli.ts users -c=100 --role=user
```
