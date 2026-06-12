J’ai une nouvelle brique à vous présenter dans l’écosystème DuploJS : @duplojs/server-utils.

Après @duplojs/utils et @duplojs/http, cette sortie marque une étape importante.

L’idée de @duplojs/server-utils est simple :
proposer un panel de fonctionnalités serveur, très utilisées au quotidien, mais avec les standards DuploJS.

Concrètement, aujourd’hui vous avez :
- Des utilitaires fichiers (lecture, écriture, JSON, dossiers, liens, copy/move/remove, fichiers temporaires…)
- Un système de création/exécution de commandes CLI typées
- La gestion des variables d’environnement (envs, args process, cwd)

Le tout :
- cross-platform (Node.js, Deno, Bun)
- fortement typé
- robuste à l’exécution
- avec une DX propre et agréable

Cette librairie est construite sur @duplojs/utils.
Elle hérite donc de la même philosophie : rendre les comportements prévisibles, explicites, et fiables, sans sacrifier l’ergonomie.

Je vous laisse découvrir :
- @duplojs/server-utils : https://server-utils.duplojs.dev/

En coopération avec Mathieu Campani et DuploJS.

#TypeScript #NodeJS #Bun #Deno #API #CLI #DX #DeveloperExperience #OpenSource #TypeSafety #RobustCode #Commander #Env #Dotenv #DuploJS