import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { AmicableEmailPanel } from '../components/AmicableEmailPanel';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { CaseTracker } from '../components/CaseTracker';
import { DocumentListItem } from '../components/DocumentListItem';
import { FileDropzone } from '../components/FileDropzone';
import { JourneyStepper } from '../components/JourneyStepper';
import type { JourneySide } from '../components/JourneyStepper';
import { LawyerReviewPanel } from '../components/LawyerReviewPanel';
import { LitigationPanel } from '../components/LitigationPanel';
import { TopBar } from '../components/TopBar';
import { ViewSwitchButton } from '../components/ViewSwitchButton';
import { useContractAnalysis } from '../hooks/useContractAnalysis';
import type { ContractAnalysisState } from '../hooks/useContractAnalysis';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import type { LegalPath } from '../stores/useLawyerReviewStore';

type LawyerView = 'review' | LegalPath;

/** Étape de l'avocat : 0 validation, 1 amiable, 2 contentieux. */
function lawyerStep(view: LawyerView, isValidated: boolean): number {
  switch (view) {
    case 'review':
      return isValidated ? 1 : 0;
    case 'amicable':
      return 1;
    case 'litigation':
      return 2;
  }
}

/** Étape du client : 0 dépôt jusqu'à la transmission, 1 validation en attente, 2 défense de ses droits. */
function clientStep(hasCase: boolean, isValidated: boolean): number {
  if (!hasCase) return 0;
  return isValidated ? 2 : 1;
}

/**
 * L'avocat travaille sur une pré-analyse à jour, transmise par le client : sinon, son espace
 * explique pourquoi il attend.
 */
function lawyerCaseBlocker(state: ContractAnalysisState, isSubmitted: boolean): string | undefined {
  if (state.isPending) return 'Le client a lancé sa pré-analyse : le dossier arrive.';
  if (state.analysis === undefined) {
    return 'Aucun dossier à valider pour l’instant. Il apparaîtra ici dès que le client l’aura transmis.';
  }
  if (state.isStale) {
    return 'Le client a modifié ses documents : le dossier reviendra après sa nouvelle pré-analyse.';
  }
  if (!isSubmitted) {
    return 'Le client a reçu sa pré-analyse mais ne l’a pas encore transmise : le dossier apparaîtra ici dès son envoi.';
  }
  return undefined;
}

export function UploadPage(): React.JSX.Element {
  const documents = useDocumentStore((state) => state.documents);
  const removeDocument = useDocumentStore((state) => state.removeDocument);
  const clearDocuments = useDocumentStore((state) => state.clearDocuments);
  const isSubmitted = useLawyerReviewStore((state) => state.submittedAt !== undefined);
  const isValidated = useLawyerReviewStore((state) => state.validatedAt !== undefined);
  const choosePath = useLawyerReviewStore((state) => state.choosePath);
  const uploadFiles = useDocumentUpload();
  const analysisState = useContractAnalysis(documents);
  const [side, setSide] = useState<JourneySide>('client');
  // Gardé d'une bascule à l'autre : l'avocat retrouve son dossier là où il l'a laissé.
  const [lawyerView, setLawyerView] = useState<LawyerView>('review');
  // On arrive au contentieux depuis la validation ou après l'amiable : le retour y ramène.
  const [litigationOrigin, setLitigationOrigin] = useState<LawyerView>('review');
  // Une nouvelle pré-analyse efface la validation : l'avocat repart de la revue des clauses.
  const activeLawyerView: LawyerView = isValidated ? lawyerView : 'review';

  const switchSide = (nextSide: JourneySide): void => {
    setSide(nextSide);
    window.scrollTo({ top: 0 });
  };

  const goTo = (nextView: LawyerView): void => {
    if (nextView === 'litigation') setLitigationOrigin(activeLawyerView);
    setLawyerView(nextView);
    window.scrollTo({ top: 0 });
  };

  const engage = (path: LegalPath): void => {
    choosePath(path);
    goTo(path);
  };

  const { analysis } = analysisState;
  const blocker = lawyerCaseBlocker(analysisState, isSubmitted);
  const hasCase = blocker === undefined;

  return (
    <>
      <TopBar>
        <ViewSwitchButton
          target={side === 'client' ? 'lawyer' : 'client'}
          onClick={() => switchSide(side === 'client' ? 'lawyer' : 'client')}
        />
      </TopBar>
      <main>
        <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
          {side === 'lawyer' ? (
            <Stack spacing={4}>
              <JourneyStepper
                side="lawyer"
                activeStep={lawyerStep(activeLawyerView, isValidated)}
              />
              {analysis === undefined || blocker !== undefined ? (
                <Stack component="section" aria-labelledby="lawyer-empty-title" spacing={2}>
                  <Typography id="lawyer-empty-title" variant="h4" component="h2">
                    Espace avocat
                  </Typography>
                  <Alert severity="info">{blocker}</Alert>
                </Stack>
              ) : (
                <>
                  {activeLawyerView === 'review' && (
                    <LawyerReviewPanel analysis={analysis} onChoosePath={engage} />
                  )}
                  {activeLawyerView === 'amicable' && (
                    <AmicableEmailPanel
                      analysis={analysis}
                      onBack={() => goTo('review')}
                      onLitigation={() => engage('litigation')}
                    />
                  )}
                  {activeLawyerView === 'litigation' && (
                    <LitigationPanel analysis={analysis} onBack={() => goTo(litigationOrigin)} />
                  )}
                </>
              )}
            </Stack>
          ) : (
            <Stack spacing={4}>
              {/* Bandeau à l'image de la slide de titre du pitch. */}
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderLeft: 8,
                  borderColor: 'secondary.main',
                  borderRadius: 1,
                  px: { xs: 3, sm: 5 },
                  py: { xs: 4, sm: 5 },
                }}
              >
                <Typography variant="overline" component="p" sx={{ color: 'secondary.main' }}>
                  Vigicontrat
                </Typography>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{ color: 'secondary.light' }}
                  gutterBottom
                >
                  Votre contrat de crédit est-il en règle&nbsp;?
                </Typography>
                <Typography variant="h6" component="p" sx={{ fontWeight: 400 }}>
                  Déposez-le : l’IA le lit gratuitement. Elle peut se tromper, alors un avocat
                  vérifie tout.
                </Typography>
              </Box>

              <JourneyStepper side="client" activeStep={clientStep(hasCase, isValidated)} />

              {analysis !== undefined && hasCase && <CaseTracker analysis={analysis} />}

              <FileDropzone onFilesAccepted={uploadFiles} />

              <Alert icon={<LockOutlinedIcon />} severity="info">
                Vos fichiers ne sont stockés nulle part : ils ne sont envoyés qu’à l’IA, pour
                l’analyse.
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
                      <DocumentListItem
                        key={document.id}
                        document={document}
                        onRemove={removeDocument}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {documents.length > 0 && <AnalysisPanel state={analysisState} />}
            </Stack>
          )}
        </Container>
      </main>
    </>
  );
}
