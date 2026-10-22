# Référentiel des clauses à rechercher

> Ce fichier est envoyé tel quel à Claude avec chaque pré-analyse. Il peut être modifié librement
> (ajout d'une catégorie, d'une jurisprudence, d'un plafond) ; la modification est prise en compte
> au prochain build. Les catégories doivent rester alignées avec la liste `category` du schéma
> de réponse (`src/types/contractAnalysis.ts`).

## Principe

Une clause est **abusive** lorsqu'elle crée, au détriment du consommateur, un **déséquilibre
significatif** entre les droits et obligations des parties (article L.212-1 du Code de la
consommation). Le caractère abusif s'apprécie au moment de la conclusion du contrat, au regard de
toutes ses circonstances et des autres clauses. Il ne porte ni sur l'objet principal du contrat ni
sur l'adéquation du prix, **à condition** que ces clauses soient rédigées de façon claire et
compréhensible.

- Le Code de la consommation distingue des clauses présumées abusives sans preuve contraire possible
  (liste « noire », article R.212-1) et des clauses présumées abusives sauf preuve contraire du
  professionnel (liste « grise », article R.212-2).
- Une clause abusive est **réputée non écrite** : elle disparaît du contrat, qui continue de
  s'appliquer sans elle.
- Seul le juge déclare une clause abusive. L'analyse signale des clauses **contestables**.

## Catégories

### `teg_taeg` : TEG / TAEG erroné

À chercher :

- TEG ou TAEG absent, incomplet ou incohérent avec les autres éléments du contrat (taux nominal,
  frais de dossier, frais de garantie, assurance obligatoire, frais de courtage).
- Frais obligatoires pour obtenir le crédit non inclus dans le calcul du TAEG.
- Intérêts calculés sur une année de 360 jours (« année lombarde ») sans que cela soit neutre
  pour l'emprunteur.

Repères : l'erreur doit en principe dépasser une décimale (0,1 point) pour être sanctionnée. La
sanction est la déchéance du droit aux intérêts, totale ou partielle, dans la proportion fixée par
le juge.

Gain possible : restitution d'une partie des intérêts payés et recalcul des échéances à venir.

### `frais_penalites` : frais et pénalités excessifs

À chercher :

- Indemnité de remboursement anticipé supérieure au plafond légal du crédit immobilier (six mois
  d'intérêts sur le capital remboursé, dans la limite de 3 % du capital restant dû).
- Indemnité de défaillance supérieure aux plafonds légaux (crédit immobilier : 7 % des sommes dues
  au titre du capital restant dû et des intérêts échus ; crédit à la consommation : 8 % du capital
  restant dû).
- Cumul de pénalités pour un même retard, frais de recouvrement mis à la charge de l'emprunteur
  sans justification, intérêts de retard majorés de façon disproportionnée.

Gain possible : réduction ou suppression des pénalités, remboursement des frais indûment prélevés.

### `decheance_terme` : déchéance du terme

À chercher :

- Clause permettant à la banque d'exiger le remboursement immédiat de la totalité du prêt sans
  mise en demeure préalable de l'emprunteur.
- Préavis de régularisation trop court : un délai de 15 jours n'est pas raisonnable (Cass. civ.
  1re, 29 mai 2024) ; ce raisonnement s'étend aux crédits à la consommation (avis de la Cour de
  cassation du 8 octobre 2025).
- Déchéance déclenchée par des événements étrangers au remboursement du prêt (changement de
  situation professionnelle, incident sur un autre contrat, fausse déclaration mineure).

En situation de surendettement, le juge doit contrôler l'attitude de la banque (Cass. civ. 2e,
22 mai 2025).

Gain possible : annulation de la déchéance du terme, retour à l'échéancier initial, arrêt ou
suspension d'une procédure de saisie.

### `responsabilite_banque` : exclusion ou limitation de la responsabilité de la banque

À chercher :

- Clause supprimant ou réduisant le droit de l'emprunteur à réparation en cas de faute de la
  banque (liste noire).
- Clause dispensant la banque de son devoir de mise en garde ou de conseil, ou faisant reconnaître
  à l'emprunteur qu'il a reçu une information qu'il n'a pas reçue.
- Clause reportant sur l'emprunteur les conséquences d'une erreur de la banque (virement, calcul).

Gain possible : dommages et intérêts, en particulier pour manquement au devoir de mise en garde
sur un crédit inadapté à la situation de l'emprunteur.

### `modification_unilaterale` : modification unilatérale par la banque

À chercher :

- Clause permettant à la banque de modifier seule la durée, le taux, les frais ou les
  caractéristiques du crédit (liste noire).
- Clause de variation du taux sans indice objectif, sans plafond ou sans réciprocité à la baisse.
- Clause permettant à la banque d'interpréter seule le contrat.

Gain possible : maintien des conditions initiales, restitution des sommes versées en application
de la modification.

### `assurance_emprunteur` : assurance emprunteur

À chercher :

- Exclusions de garantie qui ne sont ni formelles ni limitées, ou rédigées de façon imprécise
  (pathologies, sports, « affections dorsales » sans définition).
- Refus de prise en charge fondé sur une interprétation extensive des exclusions.
- Obstacles au changement d'assurance : depuis la loi Lemoine (2022), l'emprunteur peut résilier
  à tout moment et la banque doit accepter une assurance offrant des garanties équivalentes ;
  questionnaire de santé supprimé pour les prêts de moins de 200 000 € par personne remboursés
  avant les 60 ans de l'emprunteur.
- Coût de l'assurance obligatoire non intégré au TAEG.

Gain possible : prise en charge du sinistre, économie sur le coût de l'assurance (70 % des
emprunteurs n'en ont jamais changé).

### `autre` : autres clauses déséquilibrées

Toute clause qui crée un déséquilibre significatif sans relever des catégories précédentes :
domiciliation des revenus imposée sans contrepartie ou au-delà de la durée légale, clause
attributive de compétence défavorable à l'emprunteur, obligation d'exécution imposée à
l'emprunteur alors que la banque n'exécute pas la sienne, frais imposés pour la délivrance de
documents que la banque doit fournir.

## Délais à rappeler

- Action contre la banque : prescription de 5 ans (2 ans en crédit à la consommation).
- La demande tendant à faire réputer non écrite une clause abusive n'est pas soumise à la
  prescription ; la restitution des sommes versées l'est.
- Durée d'une procédure : 12 à 24 mois. Une solution amiable (médiateur bancaire) est obligatoire
  avant d'agir en justice pour un litige de moins de 5 000 €.
