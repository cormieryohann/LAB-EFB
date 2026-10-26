import { Step, StepLabel, Stepper } from '@mui/material';

/**
 * Le parcours de la slide 8, vu de chaque côté : le client suit son dossier, l'avocat le traite
 * à partir de la pré-analyse.
 */
const JOURNEY_STEPS: Record<JourneySide, string[]> = {
  client: ['Dépôt et pré-analyse IA', 'Validation par l’avocat', 'Défense de vos droits'],
  lawyer: ['Validation de la pré-analyse', 'Démarche amiable', 'Procédure contentieuse'],
};

export type JourneySide = 'client' | 'lawyer';

interface JourneyStepperProps {
  side: JourneySide;
  activeStep: number;
}

export function JourneyStepper({ side, activeStep }: JourneyStepperProps): React.JSX.Element {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {JOURNEY_STEPS[side].map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
