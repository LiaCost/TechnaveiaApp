import React, { useState } from 'react'; // Adicionado useState
import { 
  View, 
  Text, 
  StyleSheet, 
  useColorScheme, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { theme, colors } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';

// Importando ícones do Expo
import { Ionicons, FontAwesome } from '@expo/vector-icons'; 

export function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;
  
  // Estado para o "Lembrar senha"
  const [rememberMe, setRememberMe] = useState(false);

  const iconColor = colorScheme === 'dark' ? colors.light : colors.dark1;
   
  const handleLogin = () => {
    // No futuro, aqui você checaria se rememberMe é true para salvar os dados
    signIn('client'); 
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.content}>
        
        {/* Cabeçalho */}
        <Text style={[styles.logo, { color: currentTheme.text }]}>
          TECH<Text style={{ color: colors.primary }}>NAVEIA</Text>
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
          A solução tecnológica na palma da sua mão.
        </Text>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <Input placeholder="E-mail" icon="mail-outline" />
          <Input placeholder="Senha" secureTextEntry icon="lock-closed-outline" />
          
          {/* Nova Linha: Lembrar-me e Esqueceu a Senha */}
          <View style={styles.rowAction}>
            <TouchableOpacity 
              style={styles.rememberMeContainer} 
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={rememberMe ? "checkbox" : "square-outline"} 
                size={20} 
                color={rememberMe ? colors.primary : currentTheme.textSecondary} 
              />
              <Text style={[styles.rememberMeText, { color: currentTheme.textSecondary }]}>
                Lembrar-me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Esqueceu a senha?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button title="Entrar" onPress={handleLogin} />

        {/* Divisor */}
        <View style={styles.dividerContainer}>
          <View style={[styles.line, { backgroundColor: currentTheme.border }]} />
          <Text style={[styles.dividerText, { color: currentTheme.textSecondary }]}>ou entre com</Text>
          <View style={[styles.line, { backgroundColor: currentTheme.border }]} />
        </View>

        {/* Botões Sociais */}
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
            onPress={() => signIn('admin')}
          >
            <FontAwesome name="google" size={24} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
            onPress={() => signIn('tech')}
          >
            <Ionicons name="logo-apple" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Link para Criar Conta */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: currentTheme.textSecondary }]}>
            Não tem uma conta?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.link, { color: colors.primary }]}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: 'bold', marginBottom: 8, letterSpacing: -1 },
  subtitle: { fontSize: 16, marginBottom: 32, textAlign: 'center' },
  inputContainer: { width: '100%', marginBottom: 24 },
  
  // Estilo da nova linha de ações
  rowAction: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 12,
    width: '100%'
  },
  rememberMeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  rememberMeText: { 
    marginLeft: 8, 
    fontSize: 14,
    fontWeight: '500'
  },
  forgotPasswordText: { 
    fontSize: 14, 
    fontWeight: 'bold' 
  },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%' },
  line: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 10, fontSize: 14 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 30 },
  socialButton: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  footer: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 16 },
  link: { fontSize: 16, fontWeight: 'bold' },
});