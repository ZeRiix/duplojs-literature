Il faut que je vous parle d’un projet sérieux sur lequel je travaille depuis des mois.....

Cela fait maintenant plus de 3 ans que je suis développeur TypeScript, avec une véritable passion pour la robustesse du code. Il y a un peu moins d’un an, j’ai découvert la programmation fonctionnelle : un paradigme incroyable, qui a répondu à énormément de problématiques auxquelles j’ai été confronté. Je peux vous assurer qu’avant cela, je ne savais pas vraiment ce qu’était la robustesse de code.

Malheureusement, le typage des fonctions et méthodes natives de TypeScript n’est ni réellement robuste, ni prévisible. Il a été pensé avant tout pour faciliter la transition de JavaScript vers TypeScript, sans trop de friction. N’oublions pas que nous parlons à la base de développeurs JavaScript qui, avouons-le, ne sont pas réputés pour être les plus rigoureux… moi le premier à mes débuts.

Aujourd’hui, dans l’écosystème TypeScript, il existe de nombreuses petites librairies fonctionnelles. Elles proposent toutes de bonnes idées, mais aucune ne fait réellement l’unanimité. Impossible de les combiner proprement, impossible d’obtenir un écosystème réellement fonctionnel, cohérent et robuste.

C’est pour cela qu’avec l’aide d’un ami, nous avons décidé de proposer un outil open source visant à corriger les problèmes auxquels nous avons été confrontés, ainsi que certains manquements actuels de TypeScript.

Cela représente aujourd’hui plus de 300 fonctions, réparties par domaines au sein de la librairie @duplojs/utils :
 Array, Date, Either, Generator, String, Number, Object, Pattern, Clean (DDD), DataParser (zod-like), etc.

Ces briques, déjà très utiles individuellement, forment une fois réunies un écosystème complet de travail, adapté à n’importe quel environnement d’exécution JavaScript.

À l’ère de l’IA, cela peut sembler étrange de consacrer autant de temps à la robustesse. Pourtant, je suis convaincu qu’il est aujourd’hui indispensable d’offrir aussi à l’IA la capacité d’anticiper les erreurs avant même l’exécution du code, exactement comme nous cherchons à le faire en tant que développeurs.

Je vous propose donc aujourd’hui de tester @duplojs/utils, et de constater par vous-mêmes à quel point cela peut devenir indispensable.

Ce n’est que le début d’une longue série de posts sur le sujet.
 N’hésitez surtout pas à me faire vos retours 🙌

Merci à :
- William FLORENTIN, co-mainteneur de l’écosystème, pour son implication et sa vision.
- Matteo Delandhuy, développeur d’exception, qui nous a challengés dans nos idées et nos choix techniques.
- Amin N., ancien professeur, qui nous a initiés à cette passion et nous a transmis cette exigence autour du code.
🙏

👉 Lien de la documentation : https://utils.duplojs.dev/