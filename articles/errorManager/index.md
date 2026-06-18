# La gestion d’erreur ne devrait pas être un accident

Quand on parle de gestion d’erreur, on tombe souvent dans un faux débat.

Il y aurait les gens qui utilisent `throw`, les gens qui retournent `null`, les gens qui retournent `{ ok: false }`, les gens qui créent des classes `Error`, et ceux qui veulent tout transformer en monade.

Mais le vrai problème n’est pas là.

Le vrai problème, c’est que beaucoup de fonctions ne disent pas clairement ce qu’elles peuvent produire.

Elles promettent un `User`, mais peuvent aussi :
 
- ne rien trouver ;
- refuser une donnée invalide ;
- échouer à cause d’une règle métier ;
- exploser à cause d’un service tiers ;
- remonter une exception qui vient d’une autre couche.

Et tout ça n’apparaît pas dans le contrat de la fonction.

Donc on découvre les cas d’échec en lisant l’implémentation, en suivant les `throw`, ou pire, en production.

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

Mais son contrat est mensonger.

La signature donne l’impression que la fonction retourne un utilisateur. En réalité, elle peut aussi échouer pour plusieurs raisons métier.

Et ces raisons sont cachées dans le corps de la fonction.

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

À partir de là, tout commence à se mélanger.

Le premier problème n’est même pas encore de savoir comment afficher l’erreur.

Le premier problème, c’est de savoir qu’elle existe.

## Le premier problème : identifier les issues

Avec `throw`, une issue disparaît du contrat de la fonction.

Quand tu lis ça :

```ts
const user = await registerUser(email);
```

tu ne sais pas ce que `registerUser` peut produire.

Tu sais seulement ce que la fonction retourne quand tout se passe bien.

Pour découvrir le reste, tu dois lire l’implémentation.

Tu dois chercher les `throw`.

Tu dois remonter les fonctions appelées.

Tu dois espérer qu’une dépendance plus bas ne lève pas autre chose.

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

Avant même de parler de cas métier précis, on peut déjà faire beaucoup mieux que `throw`, `null` ou `{ ok: false }`.

On peut retourner un résultat explicite :

- soit une réussite ;
- soit un échec.

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

Déjà, on gagne quelque chose.

L’échec n’est plus caché dans une exception.

Il n’est plus déguisé en `null`.

Il fait partie du retour de la fonction.

La fonction assume qu’elle peut produire autre chose que son résultat nominal.

Par exemple :

```ts
function canAccessDashboard(user: User) {
	if (user.role !== "admin") {
		return error("access denied");
	}

	return success(undefined);
}
```

Pour une vérification simple, c’est largement suffisant.

Le résultat attendu est binaire : autorisé ou refusé.

Pas besoin d’inventer un système plus complexe quand le métier ne demande pas plus.

Le problème arrive quand on utilise ce modèle générique pour des cas qui ne sont plus génériques.

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

C’est mieux qu’un `throw`, mais ce n’est pas encore satisfaisant.

Déjà parce qu’ici, les deux erreurs n’ont pas la même signification.

L’une est une donnée invalide.
L’autre est un conflit métier.

Mais il y a un autre problème, plus profond : est-ce que ce sont vraiment des erreurs ?

La question n’est pas rhétorique.

Pour un développeur, on a souvent tendance à raisonner comme ça :

- ça marche : succès ;
- ça ne marche pas : erreur.

Mais le métier ne fonctionne pas toujours comme ça.

Un utilisateur déjà existant, selon le contexte, ce n’est pas forcément une erreur.

Ça peut être un point de sortie valide du processus.

Par exemple :

- afficher "vous avez déjà un compte" ;
- proposer une connexion ;
- envoyer un email de récupération ;
- refuser l’inscription avec un code public ;
- continuer le parcours différemment.

Même événement.

Plusieurs interprétations possibles.

Et c’est le métier qui décide.

Le problème, c’est que quand on force tout dans `success/error`, on impose déjà une lecture technique du monde.

On dit : "ce qui n’est pas le chemin nominal est une erreur".

Alors qu’en réalité, une fonction métier peut simplement avoir plusieurs issues valides.

Certaines produisent une donnée.

Certaines arrêtent le processus.

Certaines demandent une action utilisateur.

Certaines représentent un refus métier.

Mais toutes ne sont pas des erreurs au sens technique.

Par exemple, on peut avoir un résultat qui ressemble à ça :

```ts
type RegisterResult =
	| Success<User>
	| Error<
		| { input: string }
		| { userId: string; email: string }
	>;
```

C’est déjà mieux qu’un `throw`.

L’échec apparaît dans le type.

Mais il manque encore l’essentiel : le type ne dit pas ce que ces données signifient.

Est-ce que `{ input: string }` représente un email invalide, une valeur vide, un format refusé ?

Est-ce que `{ userId, email }` veut dire que le compte existe déjà, qu’il est suspendu, ou qu’une invitation est en attente ?

La payload décrit une forme.

Elle ne nomme pas l’issue.

Le code appelant est donc obligé de déduire l’intention à partir du contenu retourné.

Et dès que deux issues transportent la même forme de donnée, l’ambiguïté revient.

C’est là que le modèle `success/error` classique commence à manquer de précision.

Il structure le succès et l’échec.

Mais il ne structure pas encore les issues possibles.

Or, dans une application réelle, ce sont ces issues qui nous intéressent.

Pas seulement le fait que quelque chose ait échoué.

Le vrai saut qualitatif arrive quand le résultat porte une information stable.

Une information qui nomme l’issue.

Pas un message.
Pas une stacktrace.
Pas une classe technique.

Un identifiant métier.

## Nommer les issues

À ce stade, le résultat est déjà dans la donnée retournée.

Pas sous la forme d’un `null`.
Pas sous la forme d’un booléen.
Pas sous la forme d’un objet vague.

Mais il manque encore une chose : le nom de l’issue.

Un résultat vraiment exploitable doit dire :

- quelle issue s’est produite ;
- quelle donnée elle transporte ;
- comment le reste du système peut la traiter.

C’est là que l’approche de `@duplojs/utils` devient intéressante.

Pas parce qu’elle invente `Either`.

Ce concept existe déjà ailleurs.

La différence importante ici, c’est que `Left` et `Right` portent une information littérale typée.

Même si l’outil garde le vocabulaire classique `Left` / `Right`, l’enjeu n’est pas seulement de dire "succès" ou "erreur".

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

Et `register.alreadyExists` est volontairement intéressant.

Ce n’est pas forcément une erreur.

Selon le produit, ça peut être une sortie valide : afficher un message, proposer une connexion, envoyer un email de récupération, ou rediriger l’utilisateur.

L’information n’est donc pas de la décoration.

Elle est ce qui permet au code appelant de distinguer les issues sans inspecter un message, sans parser une payload, et sans deviner l’intention.

Ce détail change beaucoup de choses.

## Garder le parcours lisible

Le point important n’est pas de découper le code à tout prix.

Une inscription utilisateur est un parcours.

La donnée entre avec un état brut, puis elle avance dans plusieurs décisions :

- nettoyer l’entrée ;
- valider l’email ;
- vérifier qu’il n’est pas déjà utilisé ;
- créer l’utilisateur ;
- retourner l’issue produite.

Si on découpe ce parcours en petites fonctions indépendantes, il faut faire attention à ne pas perdre ce que chaque étape garantit.

Sinon on obtient juste une succession de fonctions flottantes qui semblent propres, mais qui ne prouvent pas vraiment le chemin suivi par la donnée.

Dans un système plus poussé, on peut aller plus loin avec des types, des contraintes ou des preuves intermédiaires : par exemple une donnée marquée comme "email valide", puis comme "email disponible".

Mais ce sujet mérite un article à part.

Ici, on peut rester simple.

Le parcours peut très bien rester visible dans une seule fonction, comme dans l’exemple précédent.

Ce qui est important ici, ce n’est pas le mot "monade".

Le mot peut même faire peur inutilement.

Ce qui compte, c’est le comportement :

- le flux nominal reste lisible ;
- les issues restent dans le type ;
- chaque sortie du parcours est nommée ;
- le code appelant sait exactement quels cas il doit gérer.

On ne met plus les points de sortie à côté du programme.
On les met dans le contrat du programme.

## Traiter l’issue à la frontière finale

Une fois que le domaine a renvoyé un cas clair, il reste une question importante : qui a le droit de l’interpréter ?

La réponse : le consommateur final.

Pas le domaine.

Pas le use case.

Pas une classe `Error` partagée partout.

Le consommateur final, c’est l’endroit où l’issue devient une décision concrète.

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

Et si demain l’interface change de parcours, le domaine ne change pas.

Si demain le produit devient multilingue, le domaine ne change pas.

Si demain on veut afficher une modale au lieu d’une redirection, le domaine ne change pas.

Pourquoi je ne prends pas HTTP comme exemple principal ici ?

Parce que HTTP n’est qu’un protocole de transport.

Il ne représente pas automatiquement la frontière finale d’une application.

Il peut transporter une issue.

Il peut catégoriser une réponse.

Mais il ne devrait pas forcément figer le message, le parcours ou l’interprétation finale.

Dans beaucoup d’applications, HTTP n’est qu’un tuyau entre le backend et l’interface.

Dans ce cas, transformer trop tôt une issue métier en message HTTP, c’est se limiter pour la suite.

Il y a une exception : si ton API publique est le produit directement consommé par des clients externes.

Là, l’API devient une frontière contractuelle.

Elle peut définir un format public, des codes publics, des messages documentés.

Mais ce n’est pas vrai par défaut.

Il faut arrêter de confondre protocole de transport et frontière applicative.

Un `403 Forbidden`, par exemple, peut cacher beaucoup de réalités différentes :

- rôle insuffisant ;
- compte suspendu ;
- ressource verrouillée ;
- limite de plan atteinte ;
- action interdite dans l’état courant du processus.

Même catégorie technique.

Issues métier différentes.

Et c’est précisément pour ça que l’information est utile.

Elle évite de demander au consommateur de réinterpréter un statut trop pauvre.

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

Il y a aussi un cas où `throw` est non seulement acceptable, mais souhaitable : le démarrage de l’application.

Une application serveur qui démarre avec une configuration invalide ne devrait pas démarrer.

Si ton application a besoin d’une clé API pour parler à un service de paiement, tu ne veux pas découvrir son absence au moment où le prochain utilisateur tente de payer.

Tu veux que l’application casse au bootstrap.

Fort.

Tout de suite.

Au bon endroit.

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
		justRead: true,
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

L’indisponibilité du fournisseur est une issue technique récupérable.

Une exception non contrôlée, elle, reste un accident.

L’idée n’est pas de prétendre que plus rien ne peut mal se passer.

L’idée est de convertir ce qui peut être contrôlé en donnée explicite, et de garder les exceptions pour ce qui est réellement exceptionnel.

## Pas besoin de tout expliquer avant

Est-ce qu’il faut forcément parler de DDD, de structure de donnée, d’architecture hexagonale, de Value Objects, de parsing, de DTO, de ports/adapters avant de parler de gestion d’erreur ?

Non.

Il suffit de poser une règle simple :

> une fonction métier doit annoncer les cas métier qu’elle peut produire.

À partir de là, on peut parler de gestion d’erreur sans demander au lecteur de connaître toute l’architecture propre.

Les autres sujets peuvent venir ensuite.

La structure de la donnée expliquera pourquoi les payloads doivent être propres.

L’architecture expliquera pourquoi le mapping de transport ne doit pas vivre dans le domaine.

Les Value Objects expliqueront pourquoi une donnée valide devrait être construite une fois, puis transportée avec son invariant.

Mais pour comprendre cet article, une seule idée suffit :

une issue attendue est un résultat possible.

Donc elle mérite d’être visible dans le type, dans le code, et dans le contrat de la fonction.

## Conclusion

La mauvaise gestion d’erreur ne vient pas seulement du fait d’utiliser `throw`.

Elle vient surtout du fait de ne pas savoir ce qu’une fonction promet vraiment.

Quand l’échec est caché, tout le monde compense :

- `try/catch` trop larges ;
- messages parsés à la main ;
- statuts ou codes de transport décidés trop bas ;
- `null` propagés ;
- logs inutilisables ;
- comportements impossibles à garantir.

À l’inverse, quand l’échec devient une donnée typée, le code devient plus honnête.

Une fonction ne dit plus seulement : "je retourne un utilisateur".

Elle dit :

- je peux créer un utilisateur ;
- je peux refuser un email invalide ;
- je peux refuser un email déjà utilisé.

Et le code appelant est obligé de gérer ces cas.

C’est ça, pour moi, une bonne gestion d’erreur : pas un `catch` mieux placé, mais un contrat plus honnête.
