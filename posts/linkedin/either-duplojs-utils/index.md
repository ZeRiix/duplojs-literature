Qu'est-ce que tu vas faire quand tout le monde va apprendre que tu fais ton taf à moitié ?

C'est bien beau de savoir insérer des utilisateurs et créer des APIs. Mais le jour où une transaction échoue, ou qu'un service tiers répond mal. Est-ce que ton code saura ce qui ne va pas ?

Tout ça à cause de `throw` qui traverse 3 couches, un `try/catch` posé à l'arrache, un `null` qui se propage, un `{ ok: false }` qui ne veut rien dire et au final tu ne sais plus ce que ta fonction promet vraiment. Et au final, même l'IA ne pourrait pas savoir ce qui se passe.

C'est exactement pour ça que j'aime autant la monade Either, et que nous avons voulu une implémentation solide dans @duplojs/utils.

L’idée est simple : au lieu d’avoir des erreurs qui vivent “à côté” du flux normal (exceptions) ou des échecs déguisés (null, boolean, etc.), tu assumes le résultat dans la donnée et dans le typage. Une Either, c’est soit un succès (Right), soit un échec (Left). Et surtout, tu peux composer ton code proprement : tant que c’est Right, ça avance, au premier Left ça s’arrête, sans que tu ne sois forcé à empiler des if partout.

Là où @duplojs/utils pousse le truc plus loin, c’est sur un détail qui a l’air anodin mais qui change vraiment la vie : Left ET Right portent toujours une information obligatoire, une string littérale, typée. Du genre `E.left("emailAlreadyExists", …)` ou `E.right("user.created", …)`.

Et cette info, ce n’est pas juste “du contexte pour faire joli”.
C’est ce qui te permet de dissocier clairement tes cas, sans ambiguïté.

Parce qu’en pratique, une fonction c’est rarement “succès ou erreur” de manière binaire. C’est plutôt “un succès possible” et “4 façons différentes d’échouer”. Et quand tu as juste `Left`, tu sais que ça a cassé… mais pas quoi. Tu finis par inspecter le payload, bricoler des champs, ou écrire des checks fragiles.

Avec l’information, tu n’as pas besoin d’aller deviner dans la valeur. L’info te dit littéralement quel cas tu as sous les yeux. Et derrière, tu peux faire une gestion beaucoup plus précise.

Bref, si tu ne devais retenir qu'une seul chose, arrête de traiter l’échec comme une exception qui remonte en vrac, et commence à le traiter comme un cas métier explicite.

En collaboration avec Mathieu Campani 🫡

Lien de la doc : https://utils.duplojs.dev/fr/v1/guide/either

#TypeScript #JavaScript #FunctionalProgramming #FP #Either #OpenSource #RobustCode #CleanCode #DX