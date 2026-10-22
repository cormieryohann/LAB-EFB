import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { AmicableEmailPanel } from '../components/AmicableEmailPanel';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { DocumentListItem } from '../components/DocumentListItem';
import { FileDropzone } from '../components/FileDropzone';
import { JourneyStepper } from '../components/JourneyStepper';
import { LawyerReviewPanel } from '../components/LawyerReviewPanel';
import { LitigationPanel } from '../components/LitigationPanel';
import { useContractAnalysis } from '../hooks/useContractAnalysis';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';

type View = 'client' | 'lawyer' | 'amicable' | 'litigation';

/** Étape du parcours (slide 8) affichée par la barre : 0 dépôt, 1 avocat, 2 amiable, 3 contentieux. */
function journeyStep(view: View, isValidated: boolean): number {
  switch (view) {
    case 'client':
      return 0;
    case 'lawyer':
      return isValidated ? 2 : 1;
    case 'amicable':
      return 2;
    case 'litigation':
      return 3;
  }
}

export function UploadPage(): React.JSX.Element {
  const documents = useDocumentStore((state) => state.documents);
  const removeDocument = useDocumentStore((state) => state.removeDocument);
  const clearDocuments = useDocumentStore((state) => state.clearDocuments);
  const isValidated = useLawyerReviewStore((state) => state.validatedAt !== undefined);
  const uploadFiles = useDocumentUpload();
  const analysisState = useContractAnalysis(documents);
  const [view, setView] = useState<View>('client');
  // On arrive au contentieux depuis la validation ou après l'amiable : le retour y ramène.
  const [litigationOrigin, setLitigationOrigin] = useState<View>('lawyer');

  const goTo = (nextView: View): void => {
    if (nextView === 'litigation') setLitigationOrigin(view);
    setView(nextView);
    window.scrollTo({ top: 0 });
  };

  if (view !== 'client' && analysisState.analysis !== undefined) {
    const { analysis } = analysisState;
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
        <Stack spacing={4}>
          <JourneyStepper activeStep={journeyStep(view, isValidated)} />
          {view === 'lawyer' && (
            <LawyerReviewPanel
              analysis={analysis}
              onBack={() => goTo('client')}
              onChoosePath={goTo}
            />
          )}
          {view === 'amicable' && (
            <AmicableEmailPanel
              analysis={analysis}
              onBack={() => goTo('lawyer')}
              onLitigation={() => goTo('litigation')}
            />
          )}
          {view === 'litigation' && (
            <LitigationPanel analysis={analysis} onBack={() => goTo(litigationOrigin)} />
          )}
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Stack spacing={4}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Votre contrat cache-t-il une clause abusive&nbsp;?
          </Typography>
          <Typography variant="h6" component="p" color="text.secondary">
            Déposez votre contrat de crédit : notre IA repère gratuitement les clauses contestables,
            puis un avocat spécialisé valide l’analyse.
          </Typography>
        </Box>

        <JourneyStepper activeStep={journeyStep(view, isValidated)} />

        <FileDropzone onFilesAccepted={uploadFiles} />

        <Alert icon={<LockOutlinedIcon />} severity="info">
          Vos fichiers sont lus dans votre navigateur et ne sont stockés nulle part. Ils seront
          envoyés uniquement à l’IA, au moment de la pré-analyse.
        </Alert>

        {documents.length > 0 && (
          <Box component="section" aria-labelledby="documents-title">
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography id="documents-title" variant="h5" component="h2">
                Documents déposés ({documents.length})
              </Typography>
              <Button color="inherit" onClick={clearDocuments}>
                Tout retirer
              </Button>
            </Stack>
            <Stack
              component="ul"
              aria-labelledby="documents-title"
              spacing={1.5}
              sx={{ p: 0, m: 0 }}
            >
              {documents.map((document) => (
                <DocumentListItem key={document.id} document={document} onRemove={removeDocument} />
              ))}
            </Stack>
          </Box>
        )}

        {documents.length > 0 && (
          <AnalysisPanel state={analysisState} onRequestLawyerValidation={() => goTo('lawyer')} />
        )}

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          L’IA au service de l’avocat, jamais à sa place : chaque résultat est une pré-analyse à
          faire valider par un avocat.
        </Typography>
      </Stack>
    </Container>
  );
}
