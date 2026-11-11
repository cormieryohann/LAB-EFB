# Consignes de rédaction du projet d'assignation

> Ce fichier est envoyé tel quel à Claude à chaque rédaction du projet d'acte de la procédure
> contentieuse. Il peut être modifié librement (structure, formules, demandes types) ; la
> modification est prise en compte au prochain build.

## Esprit

Le document est un **projet** de travail pour l'avocat, pas un acte prêt à être signifié. Il pose
la structure, les faits et les moyens ; l'avocat vérifie la juridiction, les mentions obligatoires
et les montants avant toute signification.

- Style juridique sobre et précis, phrases complètes, pas de jargon inutile.
- Ne présenter que les clauses retenues par l'avocat. Une clause « à approfondir » est présentée à
  titre subsidiaire.
- Soutenir le caractère abusif d'une clause (« il est demandé au tribunal de réputer non écrite… ») :
  c'est au juge de le déclarer.
- Citer les pièces par leur numéro du bordereau fourni (« Pièce n° 1 »). Ne pas inventer de pièce.

## Structure

La structure suit le modèle d'acte fourni dans `<modele>`
(`modeles/4-contentieux/assignation-tribunal-judiciaire.md`) : en-tête, parties, comparution,
mentions obligatoires, objet de la demande (faits, tentative amiable, moyens de droit), par ces
motifs, liste des pièces. La juridiction compétente est laissée entre crochets : l'avocat la
détermine.

Le fond de l'acte, à placer dans « OBJET DE LA DEMANDE » :

1. **Faits** : le contrat (date, montant, durée si connus), les difficultés de l'emprunteur, la
   démarche amiable et son résultat.
2. **Discussion** : une sous-partie par clause retenue, avec la citation de la clause, le moyen
   (pourquoi elle crée un déséquilibre significatif ou méconnaît la loi) et le fondement (article de
   loi, jurisprudence).
3. **Préjudice** : ce que l'emprunteur obtient pour chaque clause (clause réputée non écrite,
   restitution, déchéance du droit aux intérêts, recalcul de l'échéancier, dommages et intérêts),
   chiffré quand le dossier le permet. Ces demandes sont reprises dans « PAR CES MOTIFS », avec la
   condamnation de la banque aux dépens et au titre de l'article 700 du Code de procédure civile
   (montant entre crochets).

## Informations du dossier

Reprendre exactement chaque information de `<informations_du_dossier>` (identité et adresse des
parties, prêteur, références, dates, montants, taux). Toute information absente du dossier
(juridiction, ou une donnée que les documents ne donnent pas) est laissée entre crochets, par
exemple `[Juridiction compétente]`, pour que l'avocat la complète. Ne jamais inventer un
chiffre, une date, un nom ou une décision de justice.
