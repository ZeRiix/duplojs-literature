TypeScript ou JavaScript, rien n’y change : les dates restent toujours aussi infâmes à manipuler…

L’année dernière (je peux le dire, même si c’était il y a 7 jours 😆 ), je vous ai présenté la librairie @duplojs/utils. Aujourd’hui, je continue dans cette logique pour vous parler d’un sujet qui nous a tous déjà fait souffrir : les dates.

Franchement, je pense qu’on a tous vécu le cauchemar de l’objet Date en TypeScript. C’est un monument de non-robustesse. C’est précisément pour cette raison que la librairie @duplojs/utils propose un domaine entièrement dédié à la gestion des dates.

Première règle : pour manipuler une date, on oublie l’objet natif.

Tout passe par une string, avec un pattern spécifique et reconnaissable. Ce choix apporte deux avantages majeurs :
- Un pattern identifiable directement via le typage TypeScript (date${number}${"+" | "-"}), ce qui est tout simplement impossible avec un format ISO classique.
- Zéro problème de sérialisation : la valeur peut être passée telle quelle en paramètre, en query ou partout où une string est attendue. Contrairement à l’objet Date, qui est une vraie tannée à faire transiter du back au front… et inversement.

En bonus, ce format string s’intègre parfaitement à notre doctrine d’immutabilité.

Évidemment, cette date ne vient pas seule. Elle est accompagnée de nombreuses fonctions pour enfin rendre la manipulation des dates robuste, prévisible et agréable à utiliser (DX avant tout).

Mes fonctions désormais incontournables :
- between : déterminer si une date est comprise entre deux dates.
- min / max : récupérer la date la plus ancienne ou la plus récente dans une liste.
- now / today / yesterday / tomorrow : obtenir la date courante à l’instant T, la date arrondie à la journée, ou encore celle d’hier ou de demain à la même heure.
- round : arrondir une date à une unité donnée (jour, mois, etc.).
- closestTo : récupérer la date la plus proche dans une liste.
- each : prendre deux dates et une unité (second, day, …) et itérer entre elles via un générateur parfait pour gérer des calendriers sans dépendance externe.
- getFirstDayOfWeek / getLastDayOfWeek / getWeekOfYear / getDayOfYear, getFirstDayOfMonth / getLastDayOfMonth / getDayOfWeek / getDayOfMonth: qui permettent de récupérer des informations relatives à une date.

Sans oublier tous les setters, getter et opérateur imaginables (impossible de tous les citer ici).

L’objectif de ce domaine est simple : rendre prévisibles et sûres les opérations que nous faisons tous les jours avec les dates.

N’hésitez pas à aller jeter un œil !

Toujours en collaboration avec William FLORENTIN 🫡

Lien de la doc : https://utils.duplojs.dev/fr/v1/api/date/

#TypeScript #JavaScript #OpenSource #DX #RobustCode #CleanCode #FunctionalProgramming #Immutability