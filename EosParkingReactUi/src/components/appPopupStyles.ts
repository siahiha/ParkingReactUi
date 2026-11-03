import type { Theme } from '@mui/material/styles';

/** One visual language for every application popup, including content hosted in a portal. */
export function appPopupStyles(theme: Theme) {
  const { primary, background, text, divider, common, mode } = theme.palette;
  const mix = (first: string, percent: number, second: string) => `color-mix(in srgb, ${first} ${percent}%, ${second})`;
  const surface = background.paper;
  const field = mix(surface, 65, background.default);
  const radius = typeof theme.shape.borderRadius === 'number' ? `${theme.shape.borderRadius}px` : theme.shape.borderRadius;

  return {
    '& .MuiBackdrop-root': {
      backgroundColor: mix(common.black, mode === 'dark' ? 58 : 30, 'transparent'),
      backdropFilter: 'blur(4px)',
    },
    '& .app-popup-paper': {
      position: 'relative', overflow: 'hidden', isolation: 'isolate',
      border: '1px solid', borderColor: mix(primary.main, 24, divider),
      bgcolor: surface, color: text.primary,
      boxShadow: `0 24px 80px ${mix(common.black, mode === 'dark' ? 48 : 20, 'transparent')}, 0 4px 16px ${mix(primary.main, 12, 'transparent')}, inset 0 1px 0 ${mix(text.primary, 8, 'transparent')}`,
    },
    '& .app-popup-paper > .MuiDialogTitle-root': {
      position: 'relative', isolation: 'isolate', overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: { xs: 2, sm: 2.5 }, py: 1.5, minHeight: 64,
      fontSize: '.98rem', fontWeight: 800, lineHeight: 1.7, color: text.primary,
      background: `linear-gradient(115deg, ${mix(primary.main, mode === 'dark' ? 14 : 9, surface)}, ${surface})`,
      borderBottom: '1px solid', borderColor: mix(primary.main, 15, divider),
      '&::before': {
        content: '""', position: 'absolute', insetInline: 0, top: 0, height: 3,
        background: `linear-gradient(90deg, ${mix(primary.main, 15, surface)}, ${primary.main}, ${mix(primary.main, 15, surface)})`,
      },
      '&::after': {
        content: '""', position: 'absolute', pointerEvents: 'none', zIndex: -1,
        insetInlineEnd: 28, top: -86, width: 144, height: 144, borderRadius: '50%',
        border: `1px solid ${mix(primary.main, 16, 'transparent')}`,
        boxShadow: `0 0 0 12px ${mix(primary.main, 4, 'transparent')}, 0 0 0 28px ${mix(primary.main, 3, 'transparent')}`,
      },
    },
    '& .app-popup-mark': {
      position: 'relative', flex: '0 0 auto', width: 32, height: 32,
      borderRadius: `calc(${radius} + ${radius})`,
      background: `linear-gradient(145deg, ${surface}, ${mix(primary.main, 18, surface)})`,
      border: `1px solid ${mix(primary.main, 30, divider)}`,
      boxShadow: `0 4px 10px ${mix(primary.main, 12, 'transparent')}, inset 0 1px 0 ${mix(text.primary, 6, 'transparent')}`,
      '&::before, &::after': { content: '""', position: 'absolute', width: 13, height: 11, borderRadius: '3px', border: `1.5px solid ${primary.main}` },
      '&::before': { top: 7, insetInlineStart: 7, opacity: .4 },
      '&::after': { top: 11, insetInlineStart: 11, bgcolor: mix(primary.main, 8, surface) },
    },
    '& .app-popup-title-text': { minWidth: 0, overflowWrap: 'anywhere' },
    '& .app-popup-paper > .MuiDialogContent-root': {
      px: { xs: 2, sm: 2.5 }, py: 2.5, bgcolor: surface, overflowWrap: 'anywhere',
      scrollbarWidth: 'thin', scrollbarColor: `${mix(primary.main, 35, divider)} ${surface}`,
      '& .MuiTextField-root': { backgroundColor: 'transparent' },
      '& .MuiInputLabel-root': { background: field },
      '& .MuiInputLabel-root:not(.Mui-error):not(.Mui-disabled)': { color: mix(text.secondary, 90, text.primary) },
      '& .MuiInputLabel-root.MuiInputLabel-shrink': { background: field },
      '& .MuiInputLabel-root.Mui-focused:not(.Mui-error)': { background: surface, color: primary.main },
      '& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root': {
        backgroundColor: field, color: text.primary,
        '&:not(.Mui-disabled):hover': { backgroundColor: mix(primary.main, 4, surface) },
        '&.Mui-focused': { backgroundColor: surface, boxShadow: `0 0 0 3px ${mix(primary.main, 10, 'transparent')}` },
      },
      '& .app-group-box': { background: field, borderColor: divider },
      '& .app-group-box-title': { background: field, color: text.secondary },
    },
    '& .app-popup-paper > .MuiDialogActions-root': {
      position: 'relative', flexShrink: 0, px: { xs: 2, sm: 2.5 }, py: 1.5,
      gap: 1, flexWrap: 'wrap', borderTop: '1px solid', borderColor: mix(primary.main, 12, divider),
      background: `linear-gradient(115deg, ${mix(primary.main, 5, surface)}, ${mix(background.default, 40, surface)})`,
      boxShadow: `inset 0 1px 0 ${mix(text.primary, 3, 'transparent')}`,
      '& > .MuiButton-root': {
        m: 0, minHeight: 36, px: 2, fontWeight: 800, fontSize: '.75rem',
        transition: 'background-color 160ms ease, box-shadow 160ms ease, transform 100ms ease',
        '&:active:not(.Mui-disabled)': { transform: 'scale(.97)' },
        '&.Mui-focusVisible': { outline: `2px solid ${primary.main}`, outlineOffset: 3 },
      },
      '& > .MuiButton-textPrimary': {
        color: text.secondary,
        '&:hover': { bgcolor: mix(primary.main, 9, surface), color: text.primary },
      },
      '& > .MuiButton-outlined': { backgroundColor: surface },
      '& > .MuiButton-containedPrimary:not(.Mui-disabled)': {
        color: theme.palette.getContrastText(primary.main),
        background: `linear-gradient(135deg, ${primary.main}, ${mix(primary.main, 86, text.primary)})`,
        border: `1px solid ${mix(primary.main, 80, text.primary)}`,
        boxShadow: `0 3px 8px ${mix(primary.main, 20, 'transparent')}, inset 0 1px 0 ${mix(theme.palette.getContrastText(primary.main), 15, 'transparent')}`,
        '&:hover': { background: primary.dark, color: theme.palette.getContrastText(primary.dark), boxShadow: `0 4px 12px ${mix(primary.main, 26, 'transparent')}` },
      },
    },
    '@media (prefers-reduced-motion: reduce)': {
      '& .MuiDialogActions-root > .MuiButton-root': { transition: 'none', '&:active:not(.Mui-disabled)': { transform: 'none' } },
    },
    '@media (prefers-reduced-transparency: reduce)': {
      '& .MuiBackdrop-root': { backdropFilter: 'none', backgroundColor: mix(common.black, 55, 'transparent') },
    },
    '@media (prefers-contrast: more)': { '& .app-popup-paper': { borderColor: text.primary } },
  };
}
