export const colors = {
  dark1: '#0C0C0F',   // Fundo Dark Mode / Texto Principal White Mode
  dark2: '#111117',   // Cards e Superfícies Dark Mode
  dark3: '#1C1C2C',   // Bordas e detalhes escuros
  primary: '#00C2FF', // Ciano — Destaques, Botões, Logo
  light: '#E8EEFF',   // Fundo White Mode / Texto Principal Dark Mode
  white: '#FFFFFF',   // Cards no modo claro

  // Feedback
  success: '#00FF66',
  danger:  '#FF3366',
  warning: '#FF9800',

  // Texto secundário explícito para evitar bugs de tema
  textSecondaryLight: '#5A5A6E', // legível em fundo claro
  textSecondaryDark:  '#9A9AB0', // legível em fundo escuro (#0C0C0F)
};

export const theme = {
  light: {
    background:     colors.light,
    surface:        colors.white,
    text:           colors.dark1,
    textSecondary:  colors.textSecondaryLight, // ✅ era dark3 (#1C1C2C) — quase invisível em branco
    primary:        colors.primary,
    border:         '#D0D9ED',
  },
  dark: {
    background:     colors.dark1,
    surface:        colors.dark2,
    text:           colors.light,
    textSecondary:  colors.textSecondaryDark,  // ✅ era dark3 (#1C1C2C) — invisível em fundo escuro
    primary:        colors.primary,
    border:         colors.dark3,
  },
};