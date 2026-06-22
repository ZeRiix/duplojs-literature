# La gestion d’erreur ne devrait pas être un accident

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
		return E.right("register.alreadyExists", {
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

Dans cet exemple, `register.emailInvalid` coupe le parcours dès la validation de l’entrée.

Les deux autres issues sont placées côté `Right` parce qu’elles représentent des résultats consommables du processus d’inscription.

Et `register.alreadyExists` est volontairement intéressant.

Ce n’est pas forcément une erreur.

C’est une issue que le système peut vouloir traiter comme un cas valide du parcours.

L’information n’est donc pas de la décoration.

Elle est ce qui permet au code appelant de distinguer les issues sans inspecter un message, sans parser une payload, et sans deviner l’intention.

Ce détail a une conséquence importante.

## Traiter l’issue à la frontière finale

Une fois que le domaine a renvoyé un cas clair, il reste une question importante : qui a le droit de l’interpréter ?

La réponse : le consommateur final.

Pas le domaine.

Pas le use case.

Pas une classe `Error` partagée partout.

Le consommateur final, c’est l’endroit où l’issue prend un sens opérationnel.

Dans une application avec une interface, c’est souvent l’interface.

C’est elle qui sait :

- quelle langue utiliser ;
- quel message afficher ;
- si l’issue doit être visible ou non ;
- si elle doit ouvrir une modale ;
- si elle doit proposer une connexion ;
- si elle doit rediriger vers un autre parcours.

Le domaine ne doit pas décider ça.

Il doit seulement fournir une issue exploitable.

Peu importe que l’issue vienne d’un `Left` ou d’un `Right`, le consommateur peut se placer au niveau de l’information et décider quoi faire de chaque cas.

```ts
function consumeRegisterIssue(input: string) {
	const result = registerUser(input);

	return E.matchInformation(result, {
		"register.emailInvalid": () => ({
			screen: "register",
			field: "email",
			messageKey: "register.email.invalid",
		}),
		"register.alreadyExists": ({ email }) => ({
			screen: "login",
			prefill: { email },
			messageKey: "register.account.alreadyExists",
		}),
		"register.created": (user) => ({
			screen: "onboarding",
			user,
		}),
	});
}
```

Là, l’interprétation a du sens.

`register.emailInvalid` devient une erreur de champ.

`register.alreadyExists` peut devenir une redirection vers la connexion.

`register.created` peut ouvrir l’onboarding.

Même use case.

Trois issues.

Trois décisions de consommation.

Et si demain l’interface change de parcours, de langue ou de façon d’afficher l’information, le domaine ne change pas.

Le point important n’est donc pas de trouver une couche magique où toutes les issues devraient être transformées.

Une issue se traite là où elle peut devenir une décision concrète.

Dans une interface, cette décision peut être un message, une redirection, une modale ou un champ en erreur.

Dans un traitement en arrière-plan, ce peut être un retry, une mise en attente ou une alerte.

Dans une API publique, ce peut être un format de réponse documenté.

Mais tant qu’on n’est pas à ce niveau de décision, on a intérêt à garder l’issue exploitable.

Plus on l’interprète tôt, plus on force les consommateurs suivants à réinterpréter une information déjà appauvrie.

## Et les vraies exceptions ?

Il ne faut pas non plus tomber dans l’excès inverse.

`throw` n’est pas interdit.

Il reste utile pour les erreurs inattendues :

- bug de programmation ;
- invariant cassé ;
- environnement incohérent ;
- librairie externe qui throw ;
- erreur vraiment non récupérable à cet endroit.

Autrement dit : des cas qui ne sont pas censés arriver.

Jamais.

La règle simple est la suivante : si un cas est attendu ou récupérable par un consommateur, il mérite d’être modélisé comme une issue.

Si l’application est dans un état où elle ne devrait pas continuer, `throw` reste adapté.

Il y a aussi un cas où `throw` est non seulement acceptable, mais souhaitable : le démarrage de l’application.

Une application serveur qui démarre avec une configuration invalide ne devrait pas démarrer.

Si ton application a besoin d’une clé API pour parler à un service de paiement, tu ne veux pas découvrir son absence au moment où le prochain utilisateur tente de payer.

Tu veux que l’application échoue au bootstrap, avant d’accepter du trafic.

```ts
import { environmentVariableOrThrow } from "@duplojs/server-utils";
import { DP } from "@duplojs/utils";

export const envs = await environmentVariableOrThrow(
	{
		PAYMENT_API_KEY: DP.string(),
		PAYMENT_API_URL: DP.string(),
	},
	{
		paths: [".env", ".env.local"],
	},
);
```

Ici, le `throw` ne sert pas à gérer une issue métier.

Il sert à refuser un état dans lequel l’application n’est pas censée exister.

Ce n’est pas "un paiement refusé".

Ce n’est pas "le fournisseur de paiement est temporairement indisponible".

C’est : "l’application est mal configurée".

Donc elle ne doit pas accepter de trafic.

Elle ne doit pas attendre qu’un utilisateur déclenche le problème.

Elle doit échouer au démarrage, pendant que la CI, le déploiement ou l’équipe d’exploitation peut encore réagir.

À l’inverse, les issues métier attendues ne doivent pas être traitées comme des crashs.

Un email invalide n’est pas un crash.
Un utilisateur introuvable n’est pas forcément une exception.
Un paiement refusé n’est pas un bug.

Ce sont des cas du système.

Ils doivent donc être modélisés comme des cas du système.

Quand on travaille avec une dépendance externe, on peut aussi isoler cette frontière.

```ts
interface PaymentRequest {
	amount: number;
	cardToken: string;
};

interface PaymentAuthorization {
	authorizationId: string;
};

declare function requestPaymentAuthorization(
	request: PaymentRequest,
): Promise<
	| E.Right<"payment.authorized", PaymentAuthorization>
	| E.Left<"payment.cardExpired", PaymentRequest>
	| E.Left<"payment.insufficientFunds", PaymentRequest>
	| E.Left<"payment.providerUnavailable", { provider: "stripe" }>
>;
```

On ne dit pas seulement : "le paiement peut échouer".

On modélise les issues importantes :

- `payment.authorized` : le paiement est autorisé ;
- `payment.cardExpired` : la carte est expirée ;
- `payment.insufficientFunds` : les fonds sont insuffisants ;
- `payment.providerUnavailable` : le fournisseur n’est pas disponible.

Ce ne sont pas les mêmes situations.

Une carte expirée et des fonds insuffisants sont deux issues métier attendues.

On ne met pas un champ `reason` dans une erreur générique pour ensuite refaire un matching à la main.

L’information porte déjà le cas.

L’indisponibilité du fournisseur est une issue technique, mais elle peut rester récupérable.

L’application peut désactiver temporairement le paiement, proposer de réessayer plus tard, ou afficher un état de maintenance sur ce parcours précis.

Elle n’a pas besoin de casser tout le reste du système pour ça.

Une exception non contrôlée, elle, reste un accident.

L’idée n’est pas de prétendre que plus rien ne peut mal se passer.

L’idée est de convertir ce qui peut être contrôlé en donnée explicite, et de garder les exceptions pour ce qui est réellement exceptionnel.

## Conclusion

Un code ne devient pas robuste seulement parce qu’il attrape mieux ses erreurs.

Il devient robuste quand ses contrats décrivent réellement ce qu’il peut produire.

Une fonction métier n’a pas toujours un seul chemin intéressant.

Elle peut créer une donnée.

Elle peut refuser une entrée.

Elle peut rencontrer un état déjà existant.

Elle peut dépendre d’un service temporairement indisponible.

Et tous ces cas ne méritent pas forcément d’être cachés derrière le même mot : "erreur".

Quand une issue est attendue, elle doit être nommée.

Quand elle est nommée, elle peut être typée.

Quand elle est typée, elle peut être traitée au bon endroit.

C’est ça, pour moi, une bonne gestion d’erreur : pas un `catch` plus malin, mais un contrat plus honnête.
