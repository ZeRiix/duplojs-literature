Il manque quelque chose d’essentiel au langage TypeScript !


Aujourd’hui, si vous voulez faire du DDD, vous êtes obligé de bricoler vos outils vous-même…
Les NewTypes / Object Values n’existent pas,
les entités n’existent pas,
les monades n’existent pas.

Bref, tout ce qui est essentiel pour se concentrer uniquement sur le métier n’est pas dans le langage.

C’est là que la brique @duplojs/utils intervient pour combler ces lacunes pas comme une énième lib, mais plutôt comme une extension du langage.

@duplojs/utils intègre :
- un système de parsing de données ;
- un système de NewType, de primitives et de contraintes ;
- un système d’entités ;
- un système de repositories ;
- un système de use cases.

Le tout en respectant scrupuleusement les couches, pour éviter toute dépendance technique hormis @duplojs/utils lui-même.

Vous pouvez vous dire : « quelle horreur ! C’est une lib purement technique, qu’est-ce qu’elle fait là ? »
 Mais, au même titre que le langage est technique, il faut bien des solutions qui nous permettent de manipuler le métier proprement.

Et au contraire, @duplojs/utils ne va pas vous limiter : il va vous offrir bien plus que ce que vous pouvez faire de base avec le langage :
- un typage très poussé ;
- de l’auto-hydratation ;
- une gestion de contraintes “in-typable” très simple.

Tout cela vous permettra d’avoir une prévisibilité absolue et une robustesse incomparable.

Vous ne pourrez plus vous tromper… et votre agent non plus !

Documentation 👉 https://utils.duplojs.dev/fr/v1/api/clean/

#TypeScript #DDD #DomainDrivenDesign #CleanArchitecture #SoftwareEngineering #DevTools #DeveloperExperience #TypeSafety #FunctionalProgramming #OpenSource #NodeJS #DuploJS