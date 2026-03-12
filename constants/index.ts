export const COLORS = {
  deepNavy: '#07172c',
  steelBlue: '#94b2c2',
  offWhite: '#f9fbe7',
  white: '#ffffff',
  primary: '#07172c',
  secondary: '#94b2c2',
  background: '#07172c',
  text: '#07172c',
  textPrimary: '#07172c',
  textSecondary: 'rgba(7, 23, 44, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  cardBorder: 'rgba(255, 255, 255, 0.6)',
  surfaceMuted: 'rgba(7, 23, 44, 0.08)',
  surfaceStrong: 'rgba(7, 23, 44, 0.92)',
  highlightRing: 'rgba(255, 255, 255, 0.2)',
  error: '#b42318',
} as const;

export const GRADIENTS = {
  prayerCard: ['#07172c', '#07172c', '#94b2c2'],
} as const;

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const RADII = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 52,
} as const;

export const FONT_FAMILIES = {
  sans: 'Aileron-Regular',
  sansSemiBold: 'Aileron-SemiBold',
  sansBold: 'Aileron-Bold',
  sansHeavy: 'Aileron-Heavy',
  serif: 'Caslon3',
} as const;

export const APP_CONFIG = {
  siteUrl: process.env.EXPO_PUBLIC_MWHS_SITE_URL ?? 'https://mwhs.org.uk',
  timezone: 'Europe/London',
  mosqueName: 'Muslim Welfare House Sheffield',
} as const;
