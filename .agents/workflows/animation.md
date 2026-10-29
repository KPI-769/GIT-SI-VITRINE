---
description: animation
---

Animations de construction
Réponse initiale
Lorsque cette compétence est invoquée pour la première fois sans question précise, répondez uniquement par :

Je suis prêt à créer des animations qui me semblent justes, mes connaissances viennent de la philosophie d’animation d’Emil Kowalski.

Ne fournissez aucune autre information tant que l’utilisateur n’a pas posé une question.

Une compétence de construction. Cela fait UNE seule chose : transformer une demande de motion en une mise en œuvre qui survivrait à un examen strict. Il n’audite pas une base de code (c’est-à-dire), ne critique pas un diff (c’est-à-dire), ne cherche pas des endroits qui pourraient animer (c’est ça), ni ne construit pour React Native (c’est ça).improve-animationsreview-animationsfind-animation-opportunitiesanimate-expo

Posture opérationnelle
Vous êtes un ingénieur de conception senior qui construit vous-même l’animation. Le standard est la philosophie d’animation d’Emil Kowalski — ce même bar impose. Écris-le de façon à ce qu’il passe cette critique du premier coup.review-animations

Deux modes de défaillance, et le premier est pire :

Animer quelque chose qui ne devrait pas animer. La porte ci-dessous existe parfois pour ne produire aucune ligne de code. C’est un succès, pas une esquive.
Animer la bonne chose avec les mauvais ingrédients — sur une entrée, , images clés sur un toast, une durée qui rend un menu déroulant lent.ease-inscale(0)
Ne présentez jamais les options de mouvement comme menu. Faites l’appel, exposez le raisonnement en une ligne, écrivez le code.

Règles strictes
Exécutez la séquence dans l’ordre. Les étapes 1 et 2 bloquent tout. Ne cherchez pas une courbe avant de savoir si elle s’anime du tout.
Pas de valeurs approximatives. Chaque courbe, durée et configuration de ressort provient des tableaux ci-dessous. N’inventez jamais parce que ça vous semble familier.cubic-bezier(0.4, 0, 0.2, 1)
Étendez les jetons de la base de code, ne les forkez pas. Si une échelle de durée existe déjà, utilisez-la. Ajouter un système parallèle est un défaut.--ease-out
Réduction de la mobilité et des vaisseaux de stationnement avec l’animation, pas comme une suite.
L’outil le moins cher qui fonctionne. N’installez pas de bibliothèque de mouvement pour un fondu.
La séquence de construction
1. Devrait-il s’animer ?
Fréquence	Décision
100+ fois par jour (raccourcis clavier, bascule de palette de commandes)	Pas d’animation. Jamais. Arrête-toi ici.
Des dizaines de fois par jour (effets de survolation, navigation par liste)	Presque imperceptible seulement — rapide et subtil, ou rien
Occasionnellement (modals, tiroirs, toasts)	Animation standard
Rare / première fois (intégration, succès, célébration)	Le budget de la délice vit ici
Les actions initiées par le clavier sont un disqualifiant, pas un jugement. Raycast n’a pas d’animation d’ouverture/fermeture — c’est correct pour quelque chose ouvert des centaines de fois par jour.

Si la requête échoue à cette porte, dites-le clairement et n’écrivez pas l’animation. Proposez plutôt l’alternative sans mouvement (changement d’état instantané, une possibilité statique).

2. Quel est le but ?
Nomme-la dans l’un de ces mots avant de continuer :

Retour — confirmation que l’interface a entendu l’utilisateur
Consistance spatiale — montrer d’où vient ou est allé quelque chose
Indication d’état — rendre un changement d’état lisible
Empêcher un changement brutal — relier un contenu qui autrement se téléporterait
Explication — démontrer comment quelque chose fonctionne (marketing/intégration uniquement)
Délice — autorisé uniquement au niveau rare/première fois
Tu ne peux pas le nommer ? Ne le construis pas. « Ça a l’air cool » sur un élément souvent vu est une raison d’arrêter.

Vérifiez aussi la fonction : les données que l’utilisateur lit ou sur lesquelles l’utilisateur agit ne doivent pas bouger pour le style. Un effet décoratif de suivi de la souris appartient à une page marketing, pas à un graphique dans une application bancaire.

3. Choisissez l’outil — le moins cher qui vous convient
Descends ; Arrêtez-vous au premier qui vous convient.

Besoin	Outil
Passez le souris, appuyez sur colorer, un basculement d’état que vous contrôlez avec une classe ou un attribut	Transition CSS
Animation d’entrée sur monture, pas d’état JS	CSS @starting style
Un mouvement prédéterminé qui doit rester fluide pendant que la page est occupée à charger	Animation CSS (s’exécute hors du fil principal)
Contrôle programmatique avec performance CSS, sans bibliothèque	WAAPI (element.animate())
Ressorts, animations de mise en page, animations de sortie, valeurs pilotées par les gestes	Mouvement (motion.dev)
Les animations CSS surpassent JS sous charge — elles s’exécutent à partir du thread principal, tandis que les animations basées sur -font perdre des images pendant que le navigateur charge, scripte ou peint. Utilisez CSS pour le mouvement prédéterminé, JS pour le mouvement dynamique et interruptible.requestAnimationFrame

Si la tâche nécessite un composant plutôt qu’une animation — un toast, un tiroir, un menu de commandes, un menu déroulant — arrêtez et invoquez . Les rouler à la main, c’est comme ça que tu te retrouves avec un menu déroulant et aucune gestion de focus.pick-ui-library<div>

4. Choisir les propriétés
Transformation et opacité seulement. Ils sautent la mise en page et la peinture et tournent sur le GPU. Déclenche les trois. ( est le quatrième autorisé — voir RECIPES.md. est toléré uniquement pour les accordéons, où il n’y a pas d’équivalent en transformée.)widthheightmarginpaddingtopleftclip-pathheight
Ne jamais faire d’échelle(0). Commencez par +. Rien dans le monde réel naît de rien.scale(0.9–0.97)opacity: 0
transform-origin au déclencheur pour les popovers, menus, menus, infobulles — dans l’interface de base. Les modals sont exemptés ; Ils ne sont pas ancrés à un déclencheur, donc ils restent centrés.var(--transform-origin)
Les pourcentages dans translate() sont relatifs à la taille propre de l’élément — se déplace par sa propre hauteur, quel que soit le contenu. Je préfère plutôt que les pixels codés en dur.translateY(100%)
Dans Motion, utilise la chaîne de transformation complète. Les sténographes ne sont pas accélérés matériellement et ne tombent pas les images sous charge :xyscale
<motion.div animate={{ x: 100 }} />                          // drops frames under load
<motion.div animate={{ transform: "translateX(100px)" }} />  // hardware accelerated
Ne jamais faire transformer un enfant à partir d’une variable CSS sur le parent — cela recalcule les styles pour chaque enfant. Posez-vous directement sur l’élément.transform
5. Assouplissement et durée — ou un ressort
Assouplissement, dans l’ordre de décision :

Situation	Assouplissement
Entrée ou sortie	ease-out
Mouvement / transformation à l’écran	ease-in-out
Survol / changement de couleur	ease
Mouvement constant (marque, progression)	linear
Par défaut	ease-out
Ne faiblis jamais l’interface utilisateur. Cela commence lentement, retardant le moment exact où l’utilisateur regarde. À 200 ms semble plus rapide qu’à 200 ms.ease-outease-in

Les soulagements CSS intégrés sont trop faibles. Utilisez ceci :

--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (Ionic) */
Vous avez besoin d’une courbe qui n’est pas là ? Prenez easing.dev ou easings.co. Ne roule pas un roulé à la main.

Durée :

Élément	Durée
Retour d’information sur pression de boutons	100–160 ms
Infobulles, petits popovers	125–200 ms
Menus déroulants, sélecteurs	150–250 ms
Modals, tiroirs	200–500 ms
Marketing / explicatif	Ça peut être plus long
Les animations de l’interface utilisateur restent en dessous de 300 ms. Un menu déroulant de 180 ms est plus réactif qu’un de 400 ms.

Essayez plutôt un ressort lorsque le mouvement est traîné avec l’élan, un élément qui devrait sembler vivant, un geste que l’utilisateur peut interrompre ou inverser, ou un suivi décoratif de la souris :

{ type: "spring", duration: 0.5, bounce: 0.2 }        // Apple-style — easier to reason about
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }  // traditional physics — more control
Gardez le rebond à 0,1–0,3, et évitez le rebond dans la plupart des interfaces — réservez-le au traîner pour rejeter et aux interactions ludiques.

6. Interruption et sortie
Des transitions, pas des images clés, pour tout ce qui est déclenché rapidement — toasts, bascules, tout ce qu’un utilisateur peut déclencher deux fois par seconde. Les transitions se reciblent à partir de la valeur actuelle ; Les images clés redémarrent à zéro.
Des ressorts pour les gestes, car ils portent la vitesse à travers une interruption.
Sortez par la même façon qu’elle est entrée. Un toast qui glisse par le bas passe par le bas. Les chemins symétriques sont ce qui rend évident le balayage pour ignorer.
Un timing asymétrique où l’utilisateur décide. Lent sur la phase délibérée (pression maintenue pour confirmer : 2s linéaire), rapide sur la réponse du système (libération : détente de 200ms).
7. Réduction du mouvement et verrouillage du pointeur
Il est livré avec l’animation, à chaque fois.

@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* keep opacity/color, drop transform-based motion */
}

@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); } /* touch fires false hovers on tap */
}
const reduce = useReducedMotion();
const closedX = reduce ? 0 : '-100%';
Réduire les mouvements signifie moins d’animations et plus douces, pas zéro — gardez des transitions qui aident à la compréhension, éliminez les mouvements et les changements de position.

Recettes
Pour les implémentations prêtes à construire des cas courants — pression sur bouton, menu déroulant, infobulle, modal, tiroir, toast, accordéon, décalage, maintenu pour confirmer, indicateur de tabulation, révélation défilante, glisser pour rejeter — voir RECIPES.md. Chargez-la chaque fois que la requête correspond à l’un de ces composants ; Commencez par la recette plutôt que par un fichier vierge.

Jamais shipper
Vérifie avant de finir. Chacun de ces blocs est automatique dans :review-animations

Jamais	À la place
transition: all	Nomme les propriétés exactes
transform: scale(0) Entrée	scale(0.95) + opacity: 0
ease-in sur un élément UI	ease-out ou une courbe personnalisée forte
Intégré à une animation délibéréeease-out	cubic-bezier(0.23, 1, 0.32, 1)
Animation sur un raccourci clavier ou action 100+/jour	Pas d’animation
Durée de l’interface utilisateur supérieure à 300 ms sans raison apparente	150–250 ms
transform-origin: center sur un popover ancré par la détente	var(--transform-origin) (modals exemptés)
Images clés sur les toasts, bascules, éléments déclenchés rapidement	Transitions CSS
Animation width/height/margin/padding/top/left	transform / opacity
Mouvement // hélices sous chargexyscale	Corde complètetransform
Mouvement non détaché:hover	@media (hover: hover) and (pointer: fine)
Manquants prefers-reduced-motion	Variante plus douce, pas zéro
Tout entre en même temps	Échelonnement de 30–80 ms
Production
Écris le code. Puis, en quelques lignes au maximum :

Le résultat de la porte — niveau de fréquence et objectif désigné. Si quelque chose dans la demande a été rejeté, expliquez quoi et pourquoi.
Les ingrédients — outil, propriétés, courbe, durée ou configuration du ressort, en une ligne chacun.
Quoi vérifier le ressenti — si le résultat dépend du ressenti, vous ne pouvez pas juger du code (un fondu croisé, le rebond d’un ressort, l’équilibre opacité/hauteur dans une liste d’entrée), dites-le et pointez la vérification : jouez-le à 2–5× durée ou dans l’inspecteur d’animation DevTools, échevez image par image, testez des gestes sur un appareil réel, et regarder le lendemain avec un regard neuf et recherché
N