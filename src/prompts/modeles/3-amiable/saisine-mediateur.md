---
name: saisine-mediateur
description: Modèle de la lettre de saisine du médiateur de la consommation (médiateur bancaire ou de l'ASF). Utilisé à l'étape 3 (amiable en priorité) quand le destinataire choisi par l'avocat est le médiateur.
etape: 3. Amiable en priorité
source: Banque de France, « Lettre type de réclamation au médiateur de la consommation »
---

# Modèle : saisine du médiateur de la consommation

> Ce fichier est envoyé tel quel à Claude quand l'avocat rédige la saisine du médiateur. Le cabinet
> peut le modifier librement (formules, ordre des paragraphes, pièces jointes) ; la modification
> est prise en compte au prochain build.

## Quand l'utiliser

Deuxième temps du parcours amiable : la banque n'a pas répondu à la réclamation écrite, ou sa
réponse ne satisfait pas l'emprunteur. Le médiateur propose une solution aux deux parties.

La saisine n'est recevable que si (article L. 612-2 du Code de la consommation) :

- une réclamation écrite a d'abord été adressée à la banque ;
- le médiateur est saisi moins d'un an après cette réclamation ;
- le litige n'est pas déjà examiné par un tribunal.

La lettre doit donc **rappeler la date de la réclamation préalable** et joindre sa copie. Si cette
date n'est pas dans le dossier, la laisser entre crochets : `[date de la réclamation]`.

## Adaptation au cabinet

Le modèle de la Banque de France est rédigé à la première personne par le consommateur. Chez
VIGICONTRAT, la lettre est écrite et signée par l'avocat, **au nom et pour le compte** de son
client. Remplacer « je » par « mon client » / « ma cliente » / « mes clients » selon le dossier, ou
par le nom complet de l'emprunteur, sans déduire la civilité d'un prénom.

## Modèle

Le champ `subject` reçoit la ligne « Objet » ; le champ `body` reçoit tout le reste, de l'en-tête à
la signature, en texte brut. Les indications entre parenthèses du modèle d'origine sont remplacées
par le contenu du dossier ; les crochets restent pour ce qui manque.

```text
[Nom de l'avocat signataire]
Avocat
[Adresse du cabinet]
[Téléphone du cabinet]
[Adresse e-mail du cabinet]

Agissant pour le compte de : [nom complet du ou des emprunteurs], [adresse de l'emprunteur]

[Nom du médiateur]
[Adresse postale ou électronique du médiateur]

À [Lieu], le [Date]

Lettre recommandée avec accusé de réception

Objet : Saisine du médiateur — litige avec [nom de la banque] concernant le prêt n° [référence]

Madame la Médiatrice, Monsieur le Médiateur,

Je vous saisis en qualité de conseil de [emprunteur], en raison du litige qui l'oppose à
[nom de la banque] au sujet du [nature du crédit] n° [référence] souscrit selon offre du [date],
pour un montant de [montant] sur [durée], au taux de [taux] (TAEG : [TAEG]).

Une réclamation écrite a été adressée à [nom de la banque] le [date de la réclamation].
[Selon le dossier : la réponse apportée le [date] ne permet pas de résoudre le litige / cette
réclamation est restée sans réponse dans les délais impartis.]

En effet, [exposé du litige : pour chaque clause retenue, la citation entre guillemets, le motif
(non-respect d'une disposition légale, déséquilibre significatif, absence d'information…) et le
fondement.]

[Chronologie des faits : signature de l'offre, difficultés rencontrées, réclamation et réponse de
la banque, mise en demeure ou déchéance du terme le cas échéant.]

[Emprunteur] sollicite une solution permettant : [demandes précises et chiffrées quand c'est
possible : restitution, recalcul de l'échéancier, renonciation à une pénalité, suspension d'une
procédure de recouvrement…].

Vous trouverez en pièces jointes la copie de la réclamation adressée à [nom de la banque],
[le cas échéant : de sa réponse,] ainsi que les documents permettant la bonne compréhension du
litige.

À ce jour, aucune solution amiable n'a pu être trouvée avec l'établissement. C'est pourquoi je
vous remercie de bien vouloir intervenir dans les meilleurs délais afin de proposer une solution
aux parties. À défaut d'accord, mon client se réserve la possibilité de saisir la juridiction
compétente, tout en restant attaché à une issue amiable.

En vous remerciant par avance de l'intérêt que vous porterez à cette demande, je vous prie
d'agréer, Madame la Médiatrice, Monsieur le Médiateur, l'expression de mes salutations
distinguées.

[Nom de l'avocat signataire]
Avocat

PJ :
- Copie de la réclamation adressée à [nom de la banque]
- Copie de l'éventuelle réponse à la réclamation
- Copie de l'offre de prêt et de ses annexes
- [Copie de tout document utile à la compréhension du litige]
```

## Règles de remplissage

- Garder l'ordre du modèle : en-tête, objet, contexte du prêt, réclamation préalable, exposé du
  litige, chronologie, demandes, pièces, demande d'intervention, formule de politesse, signature,
  pièces jointes.
- L'appel « Madame la Médiatrice, Monsieur le Médiateur » reste au double genre sauf si le dossier
  donne le nom et la civilité du médiateur.
- L'exposé du litige reprend une sous-partie courte par clause retenue, dans l'ordre fourni. Une
  clause « à approfondir » est formulée avec prudence (« l'emprunteur s'interroge sur… »).
- Si le médiateur n'est pas connu, laisser `[Nom du médiateur]` et `[Adresse du médiateur]` : ne
  jamais inventer un nom ni une adresse.
