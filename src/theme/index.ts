export const colors = {
  // Cores da sua paleta
  dark1: '#0C0C0F', // Fundo Dark Mode / Texto Principal White Mode
  dark2: '#111117', // Cards e Superfícies Dark Mode
  dark3: '#1C1C2C', // Bordas e detalhes escuros
  primary: '#00C2FF', // Ciano - Destaques, Botões Principais, Logo TECHNAVEIA
  light: '#E8EEFF', // Fundo White Mode / Texto Principal Dark Mode
  white: '#FFFFFF', // Para cards no modo claro
  
  // Cores de feedback do sistema (Sucesso, Erro)
  success: '#00FF66',
  danger: '#FF3366',
};

export const theme = {
  light: {
    background: colors.light,
    surface: colors.white,
    text: colors.dark1,
    textSecondary: colors.dark3,
    primary: colors.primary,
    border: '#D0D9ED',
  },
  dark: {
    background: colors.dark1,
    surface: colors.dark2,
    text: colors.light,
    textSecondary: colors.dark3, // ou um cinza mais claro
    primary: colors.primary,
    border: colors.dark3,
  }
};