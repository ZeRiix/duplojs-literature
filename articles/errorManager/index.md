# Une erreur devrait être identifiable avant d’être traitée

Quand on parle de gestion d’erreur, on tombe souvent dans un faux débat.

`throw`, `null`, `{ ok: false }`, `Result`, `Either`, classe `Error`...

On compare des outils avant même d’avoir posé le vrai problème.

Le vrai problème, c’est le contrat des fonctions.

Une fonction peut promettre un `User`, tout en pouvant aussi refuser une donnée, ne rien trouver, rencontrer une règle métier, ou dépendre d’un service indisponible.

Si ces issues n’apparaissent pas dans le type de retour, elles finissent cachées dans l’implémentation, dans un `throw`, dans un message, ou dans une convention d’équipe.

## Le piège du `throw` métier

Un exemple classique :

```ts
async function registerUser(email: string) {
	if (!email.includes("@")) {
		throw new Error("Invalid email");
	}

	const existingUser = await userRepository.findByEmail(email);

	if (existingUser) {
		throw new Error("Email already used");
	}

	return userRepository.create({ email });
}
```

Ce code a l’air simple.

Mais sa signature ne raconte qu’une partie de l’histoire.

Elle montre le cas où l’utilisateur est créé, pas les issues qui peuvent arrêter le parcours.

Le code appelant est obligé de faire un `try/catch`, puis de deviner ce qui s’est passé.

```ts
try {
	const user = await registerUser(email);
	return response.status(201).json(user);
} catch (error) {
	return response.status(400).json({
		message: error instanceof Error
			? error.message
			: "Unknown error",
	});
}
```

## Le premier problème : identifier les issues

Avec `throw`, une issue disparaît du contrat de la fonction.

Quand tu lis ça :

```ts
const user = await registerUser(email);
```

tu ne sais pas ce que `registerUser` peut produire.

Tu sais seulement ce que la fonction retourne quand tout se passe bien.

Pour découvrir le reste, tu dois lire l’implémentation.

Tu dois chercher les `throw`, remonter les fonctions appelées, et espérer qu’une dépendance plus bas ne lève pas autre chose.

C’est déjà une perte de contrôle.

Beaucoup d’équipes essaient de compenser avec une erreur générique.

```ts
class AppError extends Error {
	constructor(
		public code: string,
		public status: number,
		public payload?: unknown,
	) {
		super(code);
	}
}
```

Puis elles l’utilisent partout :

```ts
throw new AppError(
	"EMAIL_ALREADY_USED",
	409,
	{ email },
);
```

Et à la frontière :

```ts
try {
	const user = await registerUser(email);
	return renderSuccess(user);
} catch (error) {
	return interpretAppError(error);
}
```

Sur le papier, ça donne une impression de contrôle.

En réalité, on a surtout centralisé l’ignorance.

La fonction `registerUser` ne dit toujours pas ce qu’elle peut produire.

Le code appelant n’est toujours pas forcé de gérer les cas possibles.

Le `catch` final devient un interpréteur générique de problèmes qu’il ne comprend pas vraiment.

Et chaque nouvelle erreur ajoutée quelque part dans le système peut devenir un nouveau comportement à la frontière, sans que le chemin entre les deux soit clair.

Le problème n’est donc pas seulement que l’erreur est mal affichée.

Le problème, c’est qu’elle n’est pas identifiable dans le flux.

Avant de parler de message, de statut, de popup ou de traduction, il faut d’abord répondre à une question plus simple :

quels sont les points de sortie possibles de cette fonction ?

## Le bon premier pas : succès ou échec explicite

Avant même de parler de cas métier précis, on peut déjà rendre le retour plus honnête avec un résultat explicite.

C’est le principe qu’on retrouve dans beaucoup d’implémentations de `Result`, `Either`, `Ok/Err`, `Left/Right`, etc.

Peu importe la librairie, l’idée de base ressemble souvent à ça :

```ts
type Result<Value, Failure> =
	| { type: "success"; value: Value }
	| { type: "error"; error: Failure };

function success<Value>(value: Value): Result<Value, never> {
	return {
		type: "success",
		value,
	};
}

function error<Failure>(failure: Failure): Result<never, Failure> {
	return {
		type: "error",
		error: failure,
	};
}
```

Déjà, la fonction assume qu’elle peut produire autre chose que son résultat nominal.

Par exemple :

```ts
function canAccessDashboard(user: User) {
	if (user.role !== "admin") {
		return error("access denied");
	}

	return success(undefined);
}
```

Pour une vérification simple, c’est suffisant : le résultat attendu est binaire.

Le problème arrive quand le processus n’a plus seulement deux sorties intéressantes.

```ts
function registerUser(email: string) {
	if (!email.includes("@")) {
		return error("Invalid email");
	}

	if (usersByEmail.has(email)) {
		return error("Email already used");
	}

	return success({ id: "user_1", email });
}
```

Ici, le type dit seulement :

- il y a un cas de réussite ;
- il y a un cas d’erreur.

Mais dans le code, on voit déjà trois situations : entrée invalide, compte existant, utilisateur créé.

Le canal `error` devient alors un grand sac dans lequel on met tout ce qui ne ressemble pas au résultat nominal.

Même si on remplace les messages par des payloads typées, le problème ne disparaît pas vraiment.

```ts
type RegisterResult = Result<
	User,
	| { input: string }
	| { userId: string; email: string }
>;
```

L’échec apparaît bien dans le type, mais les données retournées restent ambiguës.

Est-ce que `{ input: string }` représente un email invalide, une valeur vide, un format refusé ?

Est-ce que `{ userId, email }` veut dire que le compte existe déjà, qu’il est suspendu, ou qu’une invitation est en attente ?

On pourrait évidemment ajouter un discriminant dans la payload.

Un `type`, un `kind`, un `code`.

Et ce serait déjà une bonne intuition.

Le sujet n’est pas de dire qu’un discriminant serait inutile.

Au contraire : si cette information devient nécessaire, elle devrait structurer le résultat lui-même.

Sans discriminant, le code appelant est obligé de déduire l’intention à partir du contenu retourné.

Avec un discriminant, on améliore déjà les choses.

Mais s’il reste enfermé dans un canal `error`, on garde encore une lecture binaire : le résultat attendu d’un côté, tout le reste dans l’erreur.

C’est là que le modèle `success/error` classique commence à manquer de précision.

Il structure le succès et l’échec, mais pas encore les issues possibles.

Or, dans une application réelle, ce sont ces issues qui nous intéressent.

Le vrai changement arrive quand le résultat porte une information stable.

Une information qui nomme l’issue.

Pas un message.
Pas une stacktrace.
Pas une classe technique.

Un identifiant métier.

## Nommer les issues

À ce stade, le résultat est déjà explicite.

Mais il manque encore le plus important : le nom de l’issue.

C’est là que l’approche de `@duplojs/utils` devient intéressante.

Pas parce qu’elle invente `Either`.

Ce concept existe déjà ailleurs.

Ce qui m’intéresse ici, c’est le concept d’information, que la librairie documente dans sa partie [`Either`](https://utils.duplojs.dev/fr/v1/guide/either).

Dans cette approche, l’information joue le rôle du discriminant.

Elle ne vit pas comme une convention secondaire dans une payload.

Elle est portée directement par le résultat.

La différence importante ici, c’est que chaque `Left` et chaque `Right` porte ce marqueur littéral typé.

Il faut donc faire attention à ne pas lire `Left` et `Right` comme une vérité métier complète.

`Left` et `Right` organisent le flux.

Mais ce qui nomme réellement le cas, c’est ce marqueur.

L’enjeu n’est donc pas seulement de dire "succès" ou "erreur".

L’enjeu est de nommer précisément le point de sortie.

Dans `@duplojs/utils`, on peut écrire :

```ts
import { E } from "@duplojs/utils";

function registerUser(input: string) {
	const email = input.trim().toLowerCase();

	if (!email.includes("@")) {
		return E.left("register.emailInvalid", { input });
	}

	const existingUser = usersByEmail.get(email);

	if (existingUser) {
		return E.left("register.alreadyExists", {
			userId: existingUser.id,
			email,
		});
	}

	const user = {
		id: crypto.randomUUID(),
		email,
	};

	usersByEmail.set(email, user);

	return E.right("register.created", user);
}
```

Ici, on n’a pas juste "succès" ou "erreur".

On a trois issues métier :

- `register.emailInvalid` : l’entrée ne permet pas de continuer ;
- `register.alreadyExists` : le compte existe déjà ;
- `register.created` : le compte vient d’être créé.

Le point important, c’est que les deux `Left` ne fusionnent pas dans un simple type `Error`.

Le retour de la fonction ressemble plutôt à ça :

```ts
type RegisterIssue =
	| E.Left<"register.emailInvalid", { input: string }>
	| E.Left<"register.alreadyExists", { userId: string; email: string }>
	| E.Right<"register.created", User>;
```

Même quand deux issues sont du même côté de l’`Either`, elles ne deviennent pas le même cas.

Elles gardent chacune leur information et leur payload.

L’information n’est donc pas de la décoration.

Elle est ce qui permet au code appelant de distinguer les issues sans inspecter un message, sans parser une payload, et sans deviner l’intention.

## Exploiter les issues

Une fois les issues nommées, le code appelant n’a plus besoin de deviner ce qu’il reçoit.

Il peut matcher directement sur l’information.

Imaginons que le point de consommation soit une route HTTP classique :

```ts
const result = registerUser(input);

return E.matchInformation(result, {
	"register.emailInvalid": () => {
		return response.status(400).json({
			field: "email",
			code: "email.invalid",
		});
	},
	"register.alreadyExists": ({ email }) => {
		return response.status(409).json({
			email,
			code: "account.alreadyExists",
		});
	},
	"register.created": (user) => {
		return response.status(201).json(user);
	},
});
```

Le matching se fait sur `register.emailInvalid`, `register.alreadyExists` et `register.created`.

Ce n’est pas le contenu de la payload qui permet de deviner le cas.

C’est l’information qui discrimine l’issue.

Et surtout, ce matching est exhaustif.

Si demain `registerUser` retourne une nouvelle issue, TypeScript remonte une erreur ici.

Le code ne peut pas oublier silencieusement un nouveau cas.

## Conclusion

Le gain n’est pas seulement de remplacer `throw` par un autre outil.

Le gain, c’est de déplacer une partie du contrôle dans le contrat de la fonction.

Quand une issue est nommée dans le type, elle devient visible.

Quand elle est visible, le code appelant peut la discriminer.

Et quand le modèle évolue, TypeScript peut signaler les endroits où un cas n’est plus traité.

C’est ça qui change vraiment la gestion d’erreur : on ne dépend plus seulement de la mémoire du développeur.
