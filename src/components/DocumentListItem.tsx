import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { DOCUMENT_FORMATS } from '../constants/documentFormats';
import type { UploadedDocument } from '../types/contractDocument';
import { formatFileSize } from '../utils/formatFileSize';

interface DocumentListItemProps {
  document: UploadedDocument;
  onRemove: (id: string) => void;
}

const PREVIEW_LENGTH = 1500;

function StatusDetail({ document }: { document: UploadedDocument }): React.JSX.Element | null {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { status, content, errorMessage } = document;

  if (status === 'processing')
    return <LinearProgress aria-label="Lecture en cours" sx={{ mt: 1.5 }} />;
  if (status === 'error') {
    return (
      <Alert severity="error" sx={{ mt: 1.5 }}>
        {errorMessage}
      </Alert>
    );
  }
  if (content === undefined) return null;

  if (content.kind === 'pdf') {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        PDF prêt : il sera lu directement par l’IA, mise en page comprise.
      </Typography>
    );
  }

  const wordCount = content.text.split(/\s+/).length;
  return (
    <Box sx={{ mt: 1 }}>
      {content.approximate && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Ancien format Word : le texte a été extrait de façon approximative. Pour une analyse
          fiable, enregistrez le fichier en PDF ou en .docx.
        </Alert>
      )}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {new Intl.NumberFormat('fr-FR').format(wordCount)} mots extraits
        </Typography>
        <Button
          size="small"
          onClick={() => setPreviewOpen((open) => !open)}
          endIcon={previewOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          aria-expanded={previewOpen}
        >
          {previewOpen ? 'Masquer le texte' : 'Voir le texte'}
        </Button>
      </Stack>
      <Collapse in={previewOpen} unmountOnExit>
        <Box
          component="pre"
          sx={{
            mt: 1,
            p: 2,
            maxHeight: 280,
            overflow: 'auto',
            bgcolor: 'grey.50',
            borderRadius: 1,
            fontFamily: 'inherit',
            fontSize: 14,
            whiteSpace: 'pre-wrap',
          }}
        >
          {content.text.slice(0, PREVIEW_LENGTH)}
          {content.text.length > PREVIEW_LENGTH && '…'}
        </Box>
      </Collapse>
    </Box>
  );
}

export function DocumentListItem({ document, onRemove }: DocumentListItemProps): React.JSX.Element {
  return (
    <Paper variant="outlined" component="li" sx={{ p: 2, listStyle: 'none' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <DescriptionOutlinedIcon color="action" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 500 }}>
            {document.fileName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatFileSize(document.sizeBytes)}
          </Typography>
        </Box>
        <Chip size="small" label={DOCUMENT_FORMATS[document.format].label} />
        <IconButton
          aria-label={`Retirer ${document.fileName}`}
          onClick={() => onRemove(document.id)}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Stack>
      <StatusDetail document={document} />
    </Paper>
  );
}
