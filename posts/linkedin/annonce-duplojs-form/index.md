Les formulaires, c’est toujours chiant.

Parce que c’est toujours la même chose, mais qu’on finit quand même par repartir de zéro dès qu’on en commence un nouveau.

Je ne parle pas de la disposition des inputs ou du design.
Je parle du système et de la structure autour des formulaires :
- gérer des valeurs validées
- gérer les erreurs
- gérer des champs répétables
- gérer des champs conditionnels
- distinguer la donnée courante de la donnée réellement exploitable

À chaque fois, c’est une tannée. Librairie ou pas, la structure doit souvent être reconstruite formulaire par formulaire.

Et pour toutes ces raisons chiantes, je vous propose @duplojs/form : https://form.duplojs.dev/fr/.

C’est une librairie structure first.
Vous préparez vos inputs, vos templates, puis vous n’avez plus qu’à modéliser la structure de votre formulaire.

Champs répétables, champs multiples, champs conditionnels, gestion des erreurs avec messages… tout ce qui est habituellement fatigant à mettre en place devient beaucoup plus naturel.

Créez votre structure, et obtenez directement :
- la valeur courante du formulaire
- une fonction pour vérifier le formulaire
- une fonction de reset
- le composant prêt à être utilisé

Rien de plus simple.

La librairie distingue correctement la valeur courante de la valeur validée.
La valeur courante peut rester générique, tandis que la valeur validée doit souvent respecter un format précis, par exemple celui attendu par une API HTTP.

C’est pour cela que la librairie s’appuie sur les Data Parsers de l’écosystème DuploJS : lors de la vérification du formulaire, vous pouvez gérer les erreurs, transformer la donnée et obtenir une valeur correctement formatée.

Évidemment, tout est customisable. Même pour les cas les plus complexes, vous pouvez injecter directement vos propres templates.

Désolé pour les autres, mais pour l’instant, la librairie est uniquement disponible pour VueJS.

Cela dit, toute l’architecture a été pensée pour pouvoir accueillir d’autres frameworks front-end.
Donc si ça vous intéresse, n’hésitez pas à me le signaler !

---------

Cette librairie s’inscrit toujours dans le cadre de l’écosystème DuploJS et constitue une brique supplémentaire pour fiabiliser votre travail.

Elle n’a évidemment aucune dépendance externe à l’écosystème (ciao les risques de supply chain.)

https://github.com/duplojs