import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ErrorCode, useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import {
  ACCEPTED_EXTENSIONS,
  DROPZONE_ACCEPT,
  MAX_FILE_SIZE_BYTES,
} from '../constants/documentFormats';
import { formatFileSize } from '../utils/formatFileSize';

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
}

function rejectionMessage({ file, errors }: FileRejection): string {
  const codes = errors.map((error) => error.code);
  if (codes.includes(ErrorCode.FileTooLarge)) {
    return `${file.name} : fichier trop volumineux (maximum ${formatFileSize(MAX_FILE_SIZE_BYTES)}).`;
  }
  if (codes.includes(ErrorCode.FileInvalidType)) {
    return `${file.name} : format non pris en charge.`;
  }
  return `${file.name} : fichier refusé.`;
}

export function FileDropzone({ onFilesAccepted }: FileDropzoneProps): React.JSX.Element {
  const { getRootProps, getInputProps, isDragActive, open, fileRejections } = useDropzone({
    accept: DROPZONE_ACCEPT,
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: true,
    noClick: true,
    onDropAccepted: onFilesAccepted,
  });

  return (
    <Stack spacing={2}>
      <Box
        {...getRootProps()}
        sx={(theme) => ({
          border: 2,
          borderStyle: 'dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 3,
          bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
          px: 3,
          py: { xs: 5, sm: 7 },
          textAlign: 'center',
          transition: theme.transitions.create(['border-color', 'background-color']),
        })}
      >
        <input {...getInputProps({ 'aria-label': 'Sélectionner vos contrats' })} />
        <UploadFileIcon color="primary" sx={{ fontSize: 56, mb: 1 }} />
        <Typography variant="h6" component="p" gutterBottom>
          {isDragActive ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos documents'}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Offre de prêt, conditions générales, avenant, contrat d’assurance emprunteur…
        </Typography>
        <Button variant="contained" size="large" onClick={open}>
          Choisir des fichiers
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Formats acceptés : {ACCEPTED_EXTENSIONS.join(', ')} ·{' '}
          {formatFileSize(MAX_FILE_SIZE_BYTES)} maximum par fichier
        </Typography>
      </Box>

      {fileRejections.length > 0 && (
        <Alert severity="warning">
          {fileRejections.map((rejection) => (
            <div key={rejection.file.name}>{rejectionMessage(rejection)}</div>
          ))}
        </Alert>
      )}
    </Stack>
  );
}
