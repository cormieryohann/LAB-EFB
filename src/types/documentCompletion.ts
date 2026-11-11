/** Valeur saisie par l'avocat pour un champ laissé entre crochets par l'IA. */
export interface PlaceholderAnswer {
  /** Le champ tel qu'il apparaît dans le document, crochets compris : « [Numéro du prêt] ». */
  placeholder: string;
  value: string;
}

/** Ce que l'avocat apporte pour compléter un document déjà rédigé. */
export interface CompletionAnswers {
  answers: PlaceholderAnswer[];
  /** Précisions libres, à intégrer là où elles ont leur place. */
  notes: string;
}

/** Demande de complément : le document courant (modifications de l'avocat comprises) et les réponses. */
export interface DocumentCompletion extends CompletionAnswers {
  previousDraft: string;
}
