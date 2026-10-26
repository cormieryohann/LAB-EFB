# CLAUDE.md — VIGICONTRAT

Application web de **pré-analyse IA** de contrats de crédit, réalisée pour le Pitch Day VIGICONTRAT : l'emprunteur dépose son contrat, l'IA repère les clauses contestables, puis l'application l'oriente vers un avocat.

Lis `context.md` (le pitch, slide par slide) avant d'écrire un texte affiché à l'utilisateur, un prompt d'analyse ou un chiffre du marché. C'est la source de vérité pour le vocabulaire, les chiffres et le parcours.

Les conventions générales (stack front, nommage, style) sont dans `../../../AGENTS.md` ; ce fichier ne contient que ce qui est propre au projet.

## Contrainte d'hébergement : 100 % statique

- L'application est publiée sur GitHub Pages : https://cormieryohann.github.io/LAB-EFB/ (dépôt `cormieryohann/LAB-EFB`). Il n'y a ni serveur, ni base de données, ni secret côté build.
- Dans `vite.config.ts`, mettre `base: '/LAB-EFB/'`, sinon les assets renvoient une 404 une fois déployés.
- Utiliser `HashRouter` (React Router). GitHub Pages ne sait pas rediriger une route profonde vers `index.html`.
- Le déploiement se fait par GitHub Actions (`actions/upload-pages-artifact` puis `actions/deploy-pages`) à chaque push sur `main`.

## Appel à l'IA : clé API fournie par l'utilisateur

C'est l'utilisateur qui saisit **sa propre clé** Anthropic (BYOK), et le navigateur appelle l'API directement.

- La clé ne doit jamais apparaître dans le code, dans le build ou dans une variable `VITE_*`, car tout ce qui est bundlé devient public.
- La clé est conservée en `sessionStorage` par défaut. Elle passe en `localStorage` seulement si l'utilisateur coche « se souvenir de la clé ». Prévoir aussi un bouton pour l'effacer.
- Utiliser le SDK `@anthropic-ai/sdk` avec `new Anthropic({ apiKey, dangerouslyAllowBrowser: true })`, encapsulé dans `src/services/ClaudeService.ts`. Aucun composant n'appelle le SDK directement.
- Modèle : `claude-opus-5-5`. Fixer `output_config.effort` explicitement (`high` pour l'analyse d'un contrat), car la valeur par défaut est `medium`.
- Ne pas envoyer `temperature`, `top_p` ni `top_k` (l'API répond 400). Ne pas envoyer non plus `thinking: { type: 'disabled' }`, qui est aussi rejeté sur ce modèle.
- Contrats : chaque fichier est envoyé en bloc `document` titré du nom du fichier (PDF en base64, autres formats en texte), placé avant le texte de la consigne. La limite de 32 Mo par requête s'applique au base64 (+33 %) : 20 Mo par fichier, 30 Mo au total.
- Résultat structuré : `client.beta.messages.stream` avec `betaZodOutputFormat(ContractAnalysisSchema)` (`src/types/contractAnalysis.ts`), puis `finalMessage()`. Le schéma Zod est la seule définition du format du rapport. Attention : les `citations` sont incompatibles avec `output_config.format`.
- Refus : activer le repli côté serveur (`betas: ['server-side-fallback-2026-07-01']`, `fallbacks: 'default'`). Une réponse refusée ou tronquée n'est pas du JSON : le SDK échoue en la lisant, donc on relève le `stop_reason` via l'événement `streamEvent` pour afficher le bon message.
- Prompts : le cabinet modifie sans toucher au code le référentiel juridique (`src/prompts/clauses-abusives.md`) et les consignes du mail amiable (`src/prompts/mail-amiable.md`) et du projet d'assignation (`src/prompts/projet-assignation.md`) ; le rôle et les règles fixes sont dans les `src/prompts/*Prompt.ts`. Une catégorie ajoutée au `.md` doit aussi l'être dans `CLAUSE_CATEGORIES` et `CLAUSE_CATEGORY_LABELS`.
- Gérer les erreurs avec les classes typées du SDK : `AuthenticationError` signifie que la clé est invalide (afficher un message clair), `RateLimitError` doit être réessayée. Ne jamais faire de comparaison sur le texte des messages d'erreur.
- Si l'API Claude doit évoluer, recharger la référence (skill `claude-api`) plutôt que de se fier à sa mémoire.

## Données sensibles

Un contrat de crédit contient des données personnelles et financières. Il ne quitte le navigateur que pour l'appel à l'API Anthropic : pas d'analytics, pas de stockage du fichier, pas de log de son contenu. Le diagnostic reste en mémoire (store Zustand non persisté), et l'interface le dit à l'utilisateur.

## Domaine

- **Parcours** (slide 8), à suivre dans cet ordre : 1. dépôt et pré-analyse IA, 2. validation par l'avocat, 3. amiable en priorité, 4. procédure contentieuse. Le prototype réalise vraiment l'étape 1 ; les étapes 2 à 4 sont présentées comme la suite du service (prise de contact avec l'avocat).
- **Deux vues indépendantes**, basculées depuis la barre du haut (elles simulent deux utilisateurs) : aucun bouton d'une vue ne mène à l'autre. Chacune a sa frise en 3 étapes (`JourneyStepper`). Côté client : dépôt et pré-analyse, validation par l'avocat, défense de ses droits. Le client suit l'avancement de son dossier dans `CaseTracker`. Côté avocat : validation, amiable, contentieux. Le seul lien entre les deux vues, ce sont les stores, en particulier `useLawyerReviewStore.submittedAt` (le client clique sur « Transmettre à l'avocat » : avant ce clic, l'avocat ne voit pas le dossier) et `useLawyerReviewStore.path`, la voie choisie par l'avocat.
- **Vue client minimale** : textes courts, le moins de vocabulaire juridique possible. Le fondement (`legalBasis`) et la catégorie de la clause ne s'affichent que côté avocat (`ClauseCard variant`). L'extrait cité est replié derrière « Voir le passage du contrat ». Le prompt d'analyse réserve le jargon au champ `legalBasis`.
- **Clauses recherchées** (slide 2) : TEG/TAEG erroné, frais et pénalités excessifs, déchéance du terme (préavis de régularisation inférieur ou égal à 15 jours : Civ. 1re, 29 mai 2024 ; s'applique aussi au crédit à la consommation selon l'avis du 8 octobre 2025), exclusion ou limitation de la responsabilité de la banque, modification unilatérale, et pour l'assurance emprunteur les exclusions et refus de garantie.
- **Rapport** (slide 8) : rédigé en langage simple pour un non-juriste, il répond aux trois questions de la slide 7 (que risque-t-on, que peut-on obtenir, en combien de temps). Pour chaque clause : l'extrait cité, pourquoi elle est contestable, le gain possible, le délai. Rappeler la prescription (5 ans, 2 ans en crédit à la consommation).
- **Garde-fou** : « L'IA au service de l'avocat, jamais à sa place. » Chaque résultat est présenté comme une *pré-analyse à faire valider par un avocat*, jamais comme un avis juridique. L'IA signale une clause *contestable* ; seul le juge la déclare *abusive*.
- **Ton** : l'utilisateur est souvent en difficulté (impayés, surendettement, honte). Écrire des textes rassurants et concrets, sans jargon, en français.
