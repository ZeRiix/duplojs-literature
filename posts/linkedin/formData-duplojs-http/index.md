J’ai vraiment la flemme de perdre encore du temps pour ça...

Aujourd’hui, à l’ère de l’IA, la vitesse de développement s’accélère, mais la complexité aussi !

Et franchement, l’un des gros pain points aujourd’hui dans les librairies de serveurs HTTP, c’est l’envoi de fichiers via des formData.

La structure de base du formData n’a qu’une seule dimension. C’est beaucoup trop limité par rapport aux besoins qu’on peut avoir.

Ne serait-ce qu’avoir une liste d’images associées à un alt, c’est déjà trop complexe avec un formData.

Aujourd’hui, pour envoyer un formulaire avec des images, on est obligé de faire des appels séparés, parce que la structure de nos données a plus d’une dimension...

Et je ne vous parle même pas de la réception côté back-end, qui est catastrophique : pas robuste, complètement orientée use case, mal typée, pas sécurisée, mal intégrée, et j’en passe.

D’ailleurs, la plupart de vos APIs Node + Express peuvent se faire DDoS en envoyant des milliers de fichiers d’un octet sur ce genre de call. (C’est drôle à deux moments : quand le serveur les crée, et quand le serveur les supprime. Je vous laisse faire le calcul de combien de fichiers de 1 octet on peut envoyer dans 1 mégaoctet.)

Bref... problème résolu avec @duplojs/http : sécurisé, typé, robuste. Que demander de plus ?

Documentation 👉 https://http.duplojs.dev/

#TypeScript #NodeJS #Backend #APIDesign #DX #TypeSafety #FormData #FileUpload #WebAPI #SoftwareEngineering #OpenSource #DuploJS