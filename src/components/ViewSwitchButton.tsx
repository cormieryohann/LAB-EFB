import GavelIcon from '@mui/icons-material/Gavel';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { Button } from '@mui/material';

interface ViewSwitchButtonProps {
  /** Vue vers laquelle le bouton bascule. */
  target: 'client' | 'lawyer';
  onClick: () => void;
}

export function ViewSwitchButton({ target, onClick }: ViewSwitchButtonProps): React.JSX.Element {
  return (
    <Button
      color="inherit"
      variant="outlined"
      startIcon={target === 'lawyer' ? <GavelIcon /> : <AccountCircleOutlinedIcon />}
      onClick={onClick}
      sx={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
    >
      {target === 'lawyer' ? 'Vue avocat' : 'Vue client'}
    </Button>
  );
}
