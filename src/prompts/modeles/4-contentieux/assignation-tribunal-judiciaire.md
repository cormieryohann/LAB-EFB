---
name: assignation-tribunal-judiciaire
description: Modèle de l'assignation devant le tribunal judiciaire (procédure écrite). Utilisé à l'étape 4 (procédure contentieuse) pour rédiger le projet d'assignation de l'emprunteur contre la banque.
etape: 4. Procédure contentieuse
source: Modèle « Assignation devant le Tribunal judiciaire (procédure écrite) », fraîcheur 1er juin 2026
---

# Modèle : assignation devant le tribunal judiciaire (procédure écrite)

> Ce fichier est envoyé tel quel à Claude à chaque rédaction du projet d'assignation. Le cabinet
> peut le modifier librement (formules, mentions, demandes types) ; la modification est prise en
> compte au prochain build.

## Quand l'utiliser

Dernière étape du parcours : la démarche amiable (banque puis médiateur) n'a pas abouti et
l'avocat engage la procédure. Le résultat est un **projet** que l'avocat relit et complète ;
l'acte est ensuite signifié par un commissaire de justice.

## Comment lire le modèle

- `[Texte entre crochets]` : une donnée à remplir. La remplacer par l'information du dossier si
  elle existe ; sinon la laisser telle quelle entre crochets pour l'avocat.
- `SI « condition » :` : un paragraphe conditionnel. Choisir **une seule** branche selon les
  règles ci-dessous, retirer la ligne « SI » et ne garder que le texte de la branche retenue.
  Quand le dossier ne permet pas de choisir, garder la branche la plus probable et ajouter juste
  au-dessus `[À vérifier par l'avocat : …]`.
- `(a|ont|a|ont)` : un accord en genre et en nombre, dans l'ordre masculin singulier | masculin
  pluriel | féminin singulier | féminin pluriel. Écrire la seule forme qui correspond au client
  (ou aux adversaires), sans parenthèses. Si le genre n'est pas connu, ne pas le déduire d'un
  prénom : garder le masculin et signaler `[accord à vérifier]`.

## Choix des branches pour un litige de crédit

| Branche                                                       | Règle                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Avocat établi dans un autre État de l'UE / EEE                | Ne pas retenir, sauf indication contraire du dossier.                                                                                                                                                                                                                                                            |
| Représentation obligatoire                                    | Crédit immobilier : branche « représentation obligatoire ». Crédit à la consommation : le juge des contentieux de la protection est en principe compétent et la représentation n'y est pas obligatoire ; retenir l'autre branche et ajouter `[À vérifier par l'avocat : juridiction et mode de représentation]`. |
| Désignation des immeubles (publication au fichier immobilier) | Ne pas retenir : l'action ne porte pas sur un droit réel immobilier.                                                                                                                                                                                                                                             |
| Tentative de règlement amiable                                | Montant demandé inférieur à 5 000 € : branche « article 750-1 ». Sinon : branche générale. La démarche amiable décrite dans `<demarche_amiable>` et `<resultat_de_l_amiable>` sert à remplir les diligences et les raisons de l'échec.                                                                           |
| Dispense de tentative amiable                                 | Ne pas retenir : une démarche amiable a été menée.                                                                                                                                                                                                                                                               |
| Exécution provisoire « lorsqu'elle n'est pas de droit »       | Ne pas retenir : elle est de droit (article 514 du Code de procédure civile), sauf indication de l'avocat.                                                                                                                                                                                                       |
| Condamnation en nature / pécuniaire / dommages et intérêts    | Retenir chaque branche qui correspond à une demande du dossier (voir « Demandes propres au crédit »).                                                                                                                                                                                                            |

## Correspondance avec le dossier VIGICONTRAT

- **Client** (demandeur) : le ou les emprunteurs de `<informations_du_dossier>`, avec leur adresse.
- **Adversaire** (défendeur) : le prêteur, avec l'adresse de son siège ; l'assureur emprunteur
  s'il est concerné par une clause retenue.
- **Avocat** : l'avocat constitué indiqué dans la consigne ; son barreau et son adresse restent
  entre crochets s'ils ne sont pas fournis.
- **[Exposé des faits]** : le contrat (nature, date de l'offre, montant, durée, taux, TAEG), les
  difficultés de l'emprunteur, puis la démarche amiable et son résultat.
- **[Exposé des moyens de droit]** : une sous-partie par clause retenue, titrée, avec la citation
  de la clause, le moyen (déséquilibre significatif au sens de l'article L. 212-1 du Code de la
  consommation, ou méconnaissance d'un texte) et le fondement fourni. Puis une sous-partie
  « Préjudice » qui chiffre ce que l'emprunteur obtient pour chaque clause, quand le dossier le
  permet. Une clause « à approfondir » est présentée à titre subsidiaire.
- **[Liste des pièces]** : le `<bordereau_de_pieces>` fourni, dans le même ordre et avec la même
  numérotation. Citer les pièces dans le corps de l'acte par leur numéro (« Pièce n° 1 »).

## Demandes propres au crédit

Dans « PAR CES MOTIFS », avant les demandes de condamnation du modèle, ajouter selon les clauses
retenues :

- réputer non écrite la clause [intitulé] stipulée en page [x] de l'offre ;
- prononcer la déchéance du droit aux intérêts du prêteur, en totalité ou dans la proportion fixée
  par le juge (TAEG erroné, défaut d'information) ;
- dire que la déchéance du terme n'a pas été valablement prononcée et ordonner la reprise du
  remboursement selon l'échéancier initial ;
- condamner le prêteur à restituer les sommes indûment perçues (frais, pénalités, intérêts),
  avec un nouveau tableau d'amortissement ;
- condamner l'assureur à prendre en charge le sinistre lorsque l'exclusion de garantie est
  écartée.

## Modèle

```text
[Identification du client et sa qualité dans le dossier]
[Identité de l'adversaire et qualité dans le dossier]
[Référence du dossier]

[Type de la juridiction] [VILLE DU SIÈGE DE LA JURIDICTION]
[Intitulé de la chambre]

ASSIGNATION DEVANT LE [JURIDICTION] [VILLE DU SIÈGE DE LA JURIDICTION]

L'an [année] et le [date]

À LA REQUÊTE DE
[Identification du client et sa qualité dans le dossier]

SI « L'avocat du demandeur n'est pas inscrit à un barreau français mais est établi dans un État membre de l'Union européenne ou de l'Espace économique européen » ne correspond pas au cas :
[Représentation du client : identité de l'avocat ou, s'il y a lieu, de l'avocat postulant et de l'avocat plaidant]

SI « L'avocat du demandeur n'est pas inscrit à un barreau français mais est établi dans un État membre de l'Union européenne ou de l'Espace économique européen » correspond au cas :
Maître [Prénom et nom de l'avocat établi dans un État membre de l'UE ou de l'EEE], avocat au barreau [Adresse complète du cabinet]
Élisant domicile auprès de [Identité de l'avocat]

Au cabinet duquel il est fait élection de domicile et qui se constitue sur les présentes et ses suites,

J'AI, COMMISSAIRE DE JUSTICE SOUSSIGNÉ,

DONNÉ ASSIGNATION À
[Identification des adversaires (liste)]
Où étant et parlant à

En présence de :
[Éventuel codemandeur ou codéfendeur à l'action (pour une personne physique : nom, prénom, adresse, qualité dans le dossier, identité et barreau de son avocat ; pour une personne morale : dénomination, siège social, qualité dans le dossier, identité et barreau de son avocat)]

D'AVOIR À COMPARAÎTRE LE
[Date de l'audience (jj/mm/aa)] à [Heure de l'audience]
à l'audience et par-devant Messieurs les Président et juges composant le [Type de la juridiction en toutes lettres] [Ville du siège de la juridiction], siégeant [Adresse du siège du tribunal], pour les motifs ci-après exposés.

TRÈS IMPORTANT

SI « Représentation obligatoire » correspond au cas :
Dans les QUINZE JOURS de la date indiquée en tête du présent acte, sous réserve d'un allongement en raison de la distance, conformément aux articles 643 et 644 du Code de procédure civile, vous êtes (tenu|tenus|tenue|tenues) de charger un avocat ayant sa résidence professionnelle dans le ressort de la [Cour d'appel compétente]. Toutefois, si l'assignation vous est délivrée dans un délai inférieur ou égal à quinze jours avant la date de l'audience, vous pouvez constituer avocat jusqu'à l'audience.

Si vous ne comparaissez pas, vous vous exposez à ce qu'un jugement soit rendu contre vous sur les seuls éléments fournis par (votre|vos|votre|vos) (adversaire|adversaires|adversaire|adversaires).

Je vous rappelle les dispositions suivantes :
[Articles 5 et 5-1 de la loi n° 71-1130 du 31 décembre 1971 et articles 643 et 644 du Code de procédure civile : recopier le texte de la section « Textes à reproduire »]

SI « Représentation obligatoire » ne correspond pas au cas :
Vous pouvez vous défendre vous-même ou vous faire assister ou représenter par l'une des personnes visées à l'article 762 du Code de procédure civile :
- un avocat,
- votre conjoint, votre concubin, la personne avec laquelle vous avez conclu un pacte civil de solidarité,
- un parent ou allié en ligne directe,
- un parent ou allié en ligne collatérale jusqu'au troisième degré inclus,
- une personne exclusivement attachée à votre service personnel ou à votre entreprise.

Cette personne, si elle n'est pas avocat, doit être munie d'un pouvoir écrit et établi spécialement pour ce procès.

L'État, les départements, les régions, les communes et les établissements publics peuvent se faire représenter ou assister par un fonctionnaire ou un agent de leur administration.

Si vous ne comparaissez pas, vous vous exposez à ce qu'un jugement soit rendu contre vous sur les seuls éléments fournis par (votre|vos|votre|vos) (adversaire|adversaires|adversaire|adversaires).

Je vous rappelle les dispositions suivantes :
[Articles 5 et 5-1 de la loi n° 71-1130 du 31 décembre 1971 et articles 643 et 644 du Code de procédure civile : recopier le texte de la section « Textes à reproduire »]

Les personnes dont les ressources sont insuffisantes peuvent, si elles remplissent les conditions prévues par la loi n° 91-647 du 10 juillet 1991, bénéficier d'une aide juridictionnelle. Elles doivent, pour demander cette aide, s'adresser au bureau d'aide juridictionnelle établi au siège du tribunal judiciaire de leur domicile et, par dérogation au deuxième alinéa de l'article 5 de la loi n° 71-1130 du 31 décembre 1971, charger un avocat ayant sa résidence professionnelle dans le ressort du tribunal judiciaire [Ville du siège de la juridiction].

SI « Mentions de la désignation des immeubles exigées par la publication au fichier immobilier » correspond au cas :
Conformément aux dispositions de l'article 54, 4°, du Code de procédure civile, figurent ci-après les mentions de la désignation des immeubles exigées par la publication au fichier immobilier :
[Mentions de la désignation des immeubles]

OBJET DE LA DEMANDE

[Exposé des faits]

SI « Demande tendant au paiement d'une somme inférieure à 5 000 euros ou action liée à un conflit de voisinage (CPC, art. 750-1) » ne correspond pas au cas :
[Identité du client] (a|ont|a|ont), dans un souci de bonne foi, (tenté|tentés|tentée|tentées) préalablement de résoudre amiablement le litige, en application de [fondement de l'obligation : clause contractuelle de conciliation ou de médiation (référence de la clause et du contrat) / texte spécial applicable], en proposant à [Identité de l'adversaire] de [diligences entreprises en vue de parvenir à une résolution amiable].
Néanmoins, cette tentative n'a pu aboutir pour les raisons suivantes : [raisons de l'échec de la tentative, par exemple refus du défendeur, absence d'accord].

SI « Demande tendant au paiement d'une somme inférieure à 5 000 euros ou action liée à un conflit de voisinage (CPC, art. 750-1) » correspond au cas, et SI « Dispense de tentative de règlement amiable » ne correspond pas au cas :
Conformément aux dispositions de l'article 750-1 du Code de procédure civile, [Identité du client] (a|ont|a|ont) (tenté|tentés|tentée|tentées), préalablement à la saisine du tribunal de céans, de résoudre amiablement le litige en proposant à [Identité de l'adversaire] [diligences entreprises en vue de parvenir à une résolution amiable].
Néanmoins, cette tentative n'a pu aboutir pour les raisons suivantes : [raisons de l'échec de la tentative].

SI « Dispense de tentative de règlement amiable » correspond au cas :
Conformément à l'article 750-1, alinéa 2, du Code de procédure civile, [Identité du client] (est|sont|est|sont) (dispensé|dispensés|dispensée|dispensées) de toute tentative préalable de règlement amiable aux motifs que [l'un des motifs prévus à l'article 750-1 du Code de procédure civile].

[Exposé des moyens de droit]

Conformément aux articles 4 et 56 du Code de procédure civile, tels qu'issus de la loi n° 2023-1059 du 20 novembre 2023 et du décret n° 2023-1391 du 29 décembre 2023 entrés en vigueur le 1er septembre 2025, [Identité du client] (rappelle|rappellent|rappelle|rappellent) que les parties demeurent libres, à tout stade de la procédure, de recourir à un mode alternatif de règlement des différends afin de mettre fin au litige.
À cet égard, [Identité du client] se (déclare|déclarent|déclare|déclarent) (ouvert|ouverts|ouverte|ouvertes) à toute démarche amiable, et notamment à :
- une médiation conventionnelle ou judiciaire, conformément aux articles 131-1 et suivants du Code de procédure civile ;
- une procédure participative assistée par avocats, dans les conditions prévues aux articles 2062 et suivants du Code civil.
En cas d'accord, les parties pourront soumettre celui-ci à l'homologation du juge, qui lui conférera force exécutoire.
À défaut d'accord amiable, [Identité du client] (maintient|maintiennent|maintient|maintiennent) l'intégralité de ses demandes telles qu'exposées ci-après.

SI « Demande d'exécution provisoire lorsqu'elle n'est pas de droit » correspond au cas :
L'exécution provisoire est compatible avec la nature de l'affaire et elle est nécessaire au motif que [justification de la demande d'exécution provisoire].

PAR CES MOTIFS

Il est demandé au Tribunal de :

Déclarer la demande de [Identité du client] recevable et bien fondée, et en conséquence :

[Demandes propres au crédit, une par ligne]

SI « Demande de condamnation en nature » correspond au cas :
Condamner [Identité de l'adversaire] à [demande de condamnation en nature] ;

SI « Demande de condamnation pécuniaire » correspond au cas :
Condamner [Identité de l'adversaire] à (lui|leur|lui|leur) payer la somme de [montant en principal] euros en principal, assortie des intérêts au taux légal [à compter de la mise en demeure du [date] / à compter de la date de délivrance de la présente assignation valant mise en demeure / à compter du [date d'échéance]] ;

SI « Demande de condamnation en dommages et intérêts » correspond au cas :
Condamner [Identité de l'adversaire] à (lui|leur|lui|leur) payer la somme de [montant des dommages et intérêts] euros à titre de dommages et intérêts ;

SI « Demande d'exécution provisoire lorsqu'elle n'est pas de droit » correspond au cas :
Ordonner l'exécution provisoire de la décision à intervenir sur le fondement de l'article 515 du Code de procédure civile ;

Condamner [Identité de l'adversaire] à payer la somme de [montant au titre de l'article 700 CPC] euros en application de l'article 700 du Code de procédure civile ;
Condamner [Identité de l'adversaire] aux entiers dépens ;
Dire que, conformément aux dispositions de l'article 699 du Code de procédure civile, Maître [Identité de l'avocat] pourra recouvrer directement les frais dont il a fait l'avance sans en avoir reçu provision.

La liste numérotée des pièces justificatives visées par (le|les|la|les) (requérant|requérants|requérante|requérantes) figure dans le bordereau annexé aux présentes écritures.

LISTE DES PIÈCES JUSTIFICATIVES
[Liste numérotée des pièces]
```

## Textes à reproduire

Recopier ces textes à l'identique là où le modèle l'indique (dans chacune des deux branches de
représentation).

```text
Article 5 de la loi n° 71-1130 du 31 décembre 1971 :
« Les avocats exercent leur ministère et peuvent plaider sans limitation territoriale devant toutes les juridictions et organismes juridictionnels ou disciplinaires, sous les réserves prévues à l'article 4.
Ils peuvent postuler devant l'ensemble des tribunaux judiciaires du ressort de cour d'appel dans lequel ils ont établi leur résidence professionnelle et devant ladite cour d'appel.
Par dérogation au deuxième alinéa, les avocats ne peuvent postuler devant un autre tribunal que celui auprès duquel est établie leur résidence professionnelle ni dans le cadre des procédures de saisie immobilière, de partage et de licitation, ni au titre de l'aide juridictionnelle, ni dans des instances dans lesquelles ils ne seraient pas maîtres de l'affaire chargés également d'assurer la plaidoirie. »

Article 5-1 de la loi n° 71-1130 du 31 décembre 1971 :
« Par dérogation au deuxième alinéa de l'article 5, les avocats inscrits au barreau de l'un des tribunaux judiciaires de Paris, Bobigny, Créteil et Nanterre peuvent postuler auprès de chacune de ces juridictions. Ils peuvent postuler auprès de la cour d'appel de Paris quand ils ont postulé devant l'un des tribunaux judiciaires de Paris, Bobigny et Créteil, et auprès de la cour d'appel de Versailles quand ils ont postulé devant le tribunal judiciaire de Nanterre.
La dérogation prévue au dernier alinéa du même article 5 leur est applicable. »

Article 643 du Code de procédure civile :
« Lorsque la demande est portée devant une juridiction qui a son siège en France métropolitaine, les délais de comparution, d'appel, d'opposition, de tierce opposition dans l'hypothèse prévue à l'article 586 alinéa 3, de recours en révision et de pourvoi en cassation sont augmentés de :
1. Un mois pour les personnes qui demeurent en Guadeloupe, en Guyane, à la Martinique, à La Réunion, à Mayotte, à Saint-Barthélemy, à Saint-Martin, à Saint-Pierre-et-Miquelon, en Polynésie française, dans les îles Wallis et Futuna, en Nouvelle-Calédonie et dans les Terres australes et antarctiques françaises ;
2. Deux mois pour celles qui demeurent à l'étranger. »

Article 644 du Code de procédure civile :
« Lorsque la demande est portée devant une juridiction qui a son siège en Guadeloupe, en Guyane, à la Martinique, à La Réunion, à Mayotte, à Saint-Barthélemy, à Saint-Martin, à Saint-Pierre-et-Miquelon et dans les îles Wallis et Futuna, les délais de comparution, d'appel, d'opposition, de tierce opposition dans l'hypothèse prévue à l'article 586 alinéa 3, et de recours en révision sont augmentés d'un mois pour les personnes qui ne demeurent pas dans la collectivité territoriale dans le ressort de laquelle la juridiction a son siège et de deux mois pour les personnes qui demeurent à l'étranger. »
```

## Règles de remplissage

- Le champ `title` reçoit « Projet d'assignation devant le [juridiction] » ; le champ `body`
  reçoit l'acte complet, de l'en-tête à la liste des pièces, en texte brut.
- Garder les titres en majuscules du modèle (« À LA REQUÊTE DE », « OBJET DE LA DEMANDE »,
  « PAR CES MOTIFS »…) : ce sont les repères de l'acte.
- Les mentions réservées au commissaire de justice (date de signification, « Où étant et parlant
  à ») et la date d'audience restent entre crochets.
- Ne jamais inventer une juridiction, une date d'audience, un montant ni une décision de justice.
