Si votre gestion d’erreur ne permet pas d’identifier les issues, vous ne gérez rien.

Vous déplacez juste le problème.

Un `throw`.
Un `try/catch`.
Une `Error` générique.
Un `statusCode` collé dessus.

Ça donne l’impression d’avoir un système.

Mais si personne ne sait précisément quel cas vient de sortir, le problème n’a pas été traité.

Il a juste changé d’endroit.

J’ai écrit un article sur ce sujet :

👉 Une erreur devrait être identifiable avant d’être traitée

On y parle de `throw`, de `Either`, d’issues nommées, et de pourquoi votre `error` générique cache souvent plus de problèmes qu’il n’en résout.

Lien de l’article : [lien]

#TypeScript #JavaScript #CleanCode #ErrorHandling #TypeSafety #DuploJS
