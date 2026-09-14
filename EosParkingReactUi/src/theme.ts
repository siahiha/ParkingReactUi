import { createTheme } from '@mui/material/styles';

export type AppDirection = 'rtl' | 'ltr';

export function createAppTheme(direction: AppDirection = 'rtl') {
  return createTheme({
  direction,
  palette: {
    mode: 'light',
    primary: { main: '#234b78', dark: '#193a60', contrastText: '#ffffff' },
    secondary: { main: '#687482' },
    success: { main: '#2e7d32' },
    warning: { main: '#a86600' },
    error: { main: '#c62828' },
    info: { main: '#28658a' },
    background: { default: '#f3f5f7', paper: '#ffffff' },
    divider: '#d7dce2',
    text: { primary: '#18212b', secondary: '#687482' },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
    h1: { fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.4 },
    h2: { fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.45 },
    h6: { fontSize: '.9rem', fontWeight: 800, lineHeight: 1.5 },
    body1: { fontSize: '.82rem', lineHeight: 1.6 },
    body2: { fontSize: '.76rem', lineHeight: 1.55 },
    button: { fontSize: '.76rem', fontWeight: 700, letterSpacing: 0 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDrawer: {
      defaultProps: { anchor: direction === 'rtl' ? 'right' : 'left' },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 5, boxShadow: '0 8px 24px rgba(20, 35, 48, .18)' },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { padding: '12px 16px', fontSize: '.92rem', fontWeight: 800 } } },
    MuiDialogContent: { styleOverrides: { root: { padding: '14px 16px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '8px 12px', gap: 6 } } },
    MuiTextField: {
      defaultProps: { fullWidth: true, variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          backgroundColor: '#fbfcfd',
          '& .MuiOutlinedInput-root': {
            minHeight: 34,
            transition: 'background-color 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
          },
          '& .MuiOutlinedInput-root.Mui-focused': {
            backgroundColor: '#ffffff',
            boxShadow: '0 0 0 3px rgba(35, 75, 120, .10)',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.68rem',
            fontWeight: 600,
          },
          '& .MuiInputLabel-root.MuiInputLabel-shrink': {
            fontSize: '0.74rem',
          },
          '& .MuiFormHelperText-root': {
            marginInline: 5,
            marginTop: 3,
            fontSize: '0.68rem',
            lineHeight: 1.45,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: { root: { minHeight: 32, borderRadius: 3, paddingInline: 11 } },
    },
    MuiIconButton: {
      defaultProps: { disableRipple: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 3 },
        input: {
          fontSize: '.78rem',
          padding: '7px 10px',
          '&::placeholder': {
            fontSize: '0.68rem',
            opacity: 0.72,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { height: 26, borderRadius: 3, fontSize: '.7rem', fontWeight: 700 } },
    },
    MuiFormControlLabel: { styleOverrides: { label: { fontSize: '.74rem' } } },
    MuiAlert: { styleOverrides: { root: { padding: '5px 10px', fontSize: '.74rem' } } },
  },
  });
}

export const appTheme = createAppTheme('rtl');
