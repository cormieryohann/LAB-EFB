import SendIcon from '@mui/icons-material/Send';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' });

/** Fin de l'étape 1 : le client décide lui-même d'envoyer sa pré-analyse à l'avocat. */
export function SubmitToLawyerCard(): React.JSX.Element {
  const submittedAt = useLawyerReviewStore((state) => state.submittedAt);
  const submitToLawyer = useLawyerReviewStore((state) => state.submitToLawyer);

  if (submittedAt !== undefined) {
    return (
      <Alert severity="success">
        Dossier transmis à l’avocat le {dateFormatter.format(new Date(submittedAt))}. Suivez son
        avancement en haut de la page.
      </Alert>
    );
  }

  return (
    <Paper
      component="section"
      aria-labelledby="submit-title"
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 } }}
    >
      <Stack spacing={2}>
        <Typography id="submit-title" variant="h6" component="h2">
          Faire vérifier par un avocat
        </Typography>
        <Typography>
          L’avocat recevra vos documents et cette pré-analyse, vérifiera chaque point et vous dira
          quoi faire.
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<SendIcon />}
            onClick={submitToLawyer}
          >
            Transmettre à l’avocat
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
