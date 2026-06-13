## Post

Quand j'ai commencé à migrer mes services vers Go, j'ai réalisé un truc que j'avais ignoré pendant des années en TS :

En TypeScript, toute donnée numérique est un number.
Prix, identifiant, timestamp, latitude — même type, tout number.

En Go, tu choisis :
int8, int16, int32, int64
uint8, uint16, uint32, uint64
float32, float64

Au début ça m'a semblé verbeux. 
Maintenant je vois ça différemment.

Quand tu lis int64, tu sais que c'est un entier signé qui peut monter haut.
Quand tu vois float32, tu sais que ça peut être un prix ou une size.

Le type documente l'intention. 

Plus besoin de chercher un commentaire ou de remonter l'historique git pour comprendre ce que stocke une variable.

En TS, j'ajoutais des types utilitaires, des branded types, des validations à runtime pour compenser. 
En Go, le compilateur gère ça nativement.

Résultat : moins de code défensif, moins de bugs silencieux sur des overflows, et une relecture de PR bien plus rapide.

La verbosité apparente de Go, c'est souvent de la clarté déguisée.

Un projet Go ? Viens on discute en DM.

#Go #backend #microservice

## Réponse

Réponse assez longue, donc je la découpe en plusieurs commentaires pour rester lisible.

1/6

Je pense que le problème pointé est réel, mais que la conclusion est mauvaise.

Oui, en TypeScript, `number` ne dit pas grand-chose.

Un prix, un identifiant, un timestamp, une latitude, une quantité : tout peut finir représenté par le même type machine.

Mais remplacer `number` par `int16`, `int32`, `int64`, `uint64`, `float32` ou `float64` ne résout pas le problème. Ça le déplace.

Un `int64` ne dit pas "identifiant utilisateur".
Un `float32` ne dit pas "prix".
Un `uint32` ne dit pas "quantité commandable".

Ça dit seulement comment la donnée est représentée en mémoire.

---

2/6

Le vrai sujet, ce n’est pas TypeScript vs Go.
Le vrai sujet, c’est type machine vs type métier.

Un type machine décrit une contrainte technique :
- entier signé ou non signé ;
- taille mémoire ;
- précision ;
- bornes numériques.

Un type métier décrit une règle du domaine :
- un `UserId` doit être positif ;
- un `Price` ne doit pas être négatif ;
- un `Email` doit respecter un format valide ;
- une `Latitude` doit être comprise entre -90 et 90 ;
- une `Quantity` doit être supérieure à 0 et parfois limitée par le stock.

Ces contraintes-là ne sont pas magiquement encodées par `int64` ou `float32`.

---

3/6

Dire qu’un `int64` documente mieux l’intention qu’un `number`, c’est très discutable.

Il documente mieux la représentation, pas le métier.

Et c’est précisément là que beaucoup de bugs naissent : quand on confond la forme technique d’une donnée avec sa signification métier.

Par exemple :

```go
var userId int64 = 42
var productId int64 = 42
var price int64 = 42
```

Ces trois valeurs ont le même type, mais elles ne veulent pas du tout dire la même chose.

Le compilateur ne t’empêche pas de passer un `productId` là où tu attendais un `userId`, si tout est typé en `int64`.

---

4/6

La vraie amélioration serait plutôt :

```go
type UserId int64
type ProductId int64
type PriceCents int64
```

Et encore : ça ne suffit pas.

Parce qu’un `PriceCents` négatif reste possible si tu ne contrôles pas sa construction.

Donc il faut un constructeur, une validation, une règle métier, une frontière claire entre donnée brute et donnée validée.

Même chose pour les overflows : Go peut refuser certaines constantes hors bornes à la compilation, mais une opération runtime sur un entier peut toujours dépasser la capacité du type.

Ce n’est pas parce que le langage expose `int64` que le métier est protégé.

---

5/6

Exactement le même problème existe en TypeScript, en Go, en Java, en Rust, etc.

Les outils changent, mais le concept reste le même : une valeur métier doit être représentée par un type métier, pas par un type primitif.

C’est ce que le DDD formalise avec les Value Objects.

C’est aussi ce que certains appellent l’intypable : les contraintes qui ne peuvent pas être garanties par un type fondamental du langage et qui doivent passer par du code.

Une adresse email n’est pas une `string`.
Un prix n’est pas un `float`.
Un identifiant utilisateur n’est pas un `int64`.

Ce sont des valeurs métier avec des invariants.

---

6/6

En TypeScript, on peut utiliser des branded types, des parsers, des constructeurs, des `newType`, des contraintes runtime.

En Go, on peut utiliser des types nommés, des structs, des constructeurs, des méthodes, des validations.

En Rust, on peut faire des newtypes avec des smart constructors.

En Java, on peut faire des Value Objects avec des records/classes dédiées.

Le point important n’est donc pas : "Go a plus de types numériques que TypeScript".

Le point important est : "Est-ce que mon code empêche une valeur invalide d’entrer dans mon domaine ?"

Si la réponse est non, alors `int64` ou `number`, c’est le même problème avec une syntaxe différente.

Et au passage, utiliser `float32` pour représenter un prix devrait plutôt déclencher une alerte qu’un sentiment de clarté.

La clarté ne vient pas du fait d’avoir plus de primitives.
Elle vient du fait de modéliser correctement le domaine.

La verbosité utile, ce n’est pas écrire `int64` au lieu de `number`.
C’est créer un vrai `UserId`, un vrai `Price`, une vraie `Latitude`, avec les contraintes qui rendent les états invalides difficiles ou impossibles à représenter.

Sinon on ne fait que donner un nom plus précis au mauvais niveau d’abstraction.
