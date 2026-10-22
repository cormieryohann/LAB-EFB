import { Step, StepLabel, Stepper } from '@mui/material';

/** Parcours unique présenté au pitch (slide 8). */
const JOURNEY_STEPS = [
  'Dépôt et pré-analyse IA',
  'Validation par l’avocat',
  'Amiable en priorité',
  'Procédure contentieuse',
];

interface JourneyStepperProps {
  activeStep: number;
}

export function JourneyStepper({ activeStep }: JourneyStepperProps): React.JSX.Element {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {JOURNEY_STEPS.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
