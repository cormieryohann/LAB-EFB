---
name: reclamation-banque
description: Modèle de la lettre de réclamation adressée au service client ou réclamations de la banque. Utilisé à l'étape 3 (amiable en priorité) quand le destinataire choisi par l'avocat est la banque.
etape: 3. Amiable en priorité
source: Banque de France, « Lettre type de réclamation au service client de la banque »
---

# Modèle : réclamation au service réclamations de la banque

> Ce fichier est envoyé tel quel à Claude quand l'avocat rédige la réclamation adressée à la
> banque. Le cabinet peut le modifier librement (formules, ordre des paragraphes, pièces jointes) ;
> la modification est prise en compte au prochain build.

## Quand l'utiliser

C'est la **première démarche** du parcours amiable : la banque doit avoir l'occasion de corriger la
situation avant toute saisine du médiateur. Cette réclamation écrite est aussi la condition de
recevabilité de la médiation (article L. 612-2 du Code de la consommation) : elle doit donc être
datée, précise et conservée.

## Adaptation au cabinet

Le modèle de la Banque de France est rédigé à la première personne par le consommateur. Chez
VIGICONTRAT, la lettre est écrite et signée par l'avocat, **au nom et pour le compte** de son
client. Remplacer donc « je » par « mon client » / « ma cliente » / « mes clients » selon le dossier,
ou par le nom complet de l'emprunteur, sans déduire la civilité d'un prénom.

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

[Nom de la banque] — Service réclamations
[Adresse du service réclamations ou, à défaut, du siège du prêteur]

À [Lieu], le [Date]

Lettre recommandée avec accusé de réception

Objet : Réclamation concernant le prêt n° [référence] — [nom de l'emprunteur]

Madame, Monsieur,

Je vous écris en qualité de conseil de [emprunteur], au sujet du [nature du crédit] n° [référence]
souscrit auprès de votre établissement selon offre du [date], pour un montant de [montant] sur
[durée], au taux de [taux] (TAEG : [TAEG])[, assorti d'une assurance emprunteur souscrite auprès de
[assureur]].

[Exposé du mécontentement : pour chaque clause retenue, la citation entre guillemets, le motif
(non-respect d'une disposition légale, déséquilibre significatif, absence d'information…) et le
fondement.]

[Chronologie des faits : signature de l'offre, difficultés rencontrées, mise en demeure ou
déchéance du terme le cas échéant, démarches déjà effectuées.]

En conséquence, [emprunteur] vous demande de : [demandes précises et chiffrées quand c'est
possible : restitution, recalcul de l'échéancier, renonciation à une pénalité, suspension d'une
procédure de recouvrement…].

Je vous remercie de me faire connaître votre position dans un délai de 30 jours à compter de la
réception du présent courrier. À défaut de réponse satisfaisante dans ce délai, mon client
saisira le médiateur [nom du médiateur indiqué au contrat], tout en restant attaché à une solution
amiable.

En vous remerciant par avance de l'attention que vous porterez à cette demande, je vous prie
d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Nom de l'avocat signataire]
Avocat

PJ :
- Copie de l'offre de prêt et de ses annexes
- [Copie de tout document utile à la compréhension du litige : tableau d'amortissement, courrier de
  mise en demeure, relevés…]
```

## Règles de remplissage

- Garder l'ordre du modèle : en-tête, objet, contexte du prêt, mécontentement, chronologie,
  demandes, délai, formule de politesse, signature, pièces jointes.
- L'exposé du mécontentement est le cœur de la lettre : une sous-partie courte par clause retenue,
  dans l'ordre fourni. Une clause « à approfondir » est formulée comme une question (« nous vous
  remercions de nous préciser… »).
- La liste des pièces jointes ne cite que des documents dont le dossier mentionne l'existence ;
  les autres restent entre crochets.
- Si le médiateur n'est pas connu, écrire « le médiateur compétent » et non un nom inventé.
