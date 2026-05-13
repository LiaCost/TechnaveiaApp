

import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, useColorScheme, SafeAreaView, 
  TouchableOpacity, ScrollView, Switch, Alert 
} from 'react-native';
import { theme, colors } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';
import { fetchAddressByCep } from '../../services/addressService';
import { ImageSelector } from '../../components/ImageSelector';
import { CategoryCard } from '../../components/CategoryCard';
import Slider from '@react-native-community/slider';
export function RegisterScreen({ navigation }: any) {
    //Especialidades que o técnico pode escolher
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const toggleSpec = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };
  // Estados para Endereço
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState({
    street: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [loadingCep, setLoadingCep] = useState(false);
  //Função mágica
  const handleCepChange = async (value: string) => {
    setCep(value);
    if (value.length === 8) {
      setLoadingCep(true);
      const data = await fetchAddressByCep(value);
      if (data) {
        setAddress({
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf
        });
      } else {
        Alert.alert("Erro", "CEP não encontrado.");
      }
      setLoadingCep(false);
    }
  };

 //Antigo 
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;
  
  const [userType, setUserType] = useState<'none' | 'client' | 'tech'>('none');
  const [step, setStep] = useState(1);
  const [isPJ, setIsPJ] = useState(false);
  const [radius, setRadius] = useState(5);
  const [modalidade, setModalidade] = useState<'presencial' | 'remoto' | 'ambos'>('presencial');

  // --- NAVEGAÇÃO ENTRE PASSOS ---
  const nextStep = () => setStep(step + 1);
  const prevStep = () => step > 1 ? setStep(step - 1) : setUserType('none');

  if (userType === 'none') return <SelectionScreen />;
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.stepIndicator, { color: colors.primary }]}>
          {userType === 'client' ? `Cliente: Passo ${step}/5` : `Técnico: Passo ${step}/7`}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {userType === 'client' ? renderClientSteps() : renderTechSteps()}
      </ScrollView>
    </SafeAreaView>
  );

  // --- FLUXO DO CLIENTE ---
  function renderClientSteps() {
    switch(step) {
      case 1: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Dados Pessoais</Text>
          <Input placeholder="Nome Completo" />
          <Input placeholder="CPF" />
          <Input placeholder="Data de Nascimento" />
          <Input placeholder="Gênero (Opcional)" />
          <Button title="Próximo" onPress={nextStep} />
        </View>
      );
      case 2: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Contato</Text>
          <Input placeholder="E-mail" />
          <Input placeholder="Telefone/Celular" />
          <Button title="Enviar Código SMS" type="secondary" onPress={() => {}} />
          <Input placeholder="Código de Verificação" />
          <Button title="Verificar e Próximo" onPress={nextStep} />
        </View>
      );
      case 3: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Endereço Principal</Text>
          
          <Input 
            placeholder="Digite seu CEP" 
            keyboardType="numeric"
            maxLength={8}
            value={cep}
            onChangeText={handleCepChange}
          />
          
          {loadingCep && <Text style={{color: colors.primary}}>Buscando endereço...</Text>}

          <Input 
            placeholder="Rua" 
            value={address.street} 
            onChangeText={(t) => setAddress({...address, street: t})} 
          />
          
          <View style={{flexDirection: 'row', gap: 10}}>
            <View style={{flex: 1}}>
              <Input placeholder="Nº" keyboardType="numeric" />
            </View>
            <View style={{flex: 2}}>
              <Input 
                placeholder="Bairro" 
                value={address.neighborhood}
                onChangeText={(t) => setAddress({...address, neighborhood: t})}
              />
            </View>
          </View>

          <View style={{flexDirection: 'row', gap: 10}}>
            <View style={{flex: 2}}>
              <Input placeholder="Cidade" value={address.city} />
            </View>
            <View style={{flex: 1}}>
              <Input placeholder="UF" value={address.state} />
            </View>
          </View>

          <Button title="Próximo" onPress={nextStep} />
        </View>
      );
      case 4: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Segurança</Text>
          <Input placeholder="Senha" secureTextEntry />
          <Input placeholder="Confirmar Senha" secureTextEntry />
          <Text style={{color: currentTheme.textSecondary, marginBottom: 20}}>Ao continuar, você aceita nossos Termos de Uso.</Text>
          <Button title="Finalizar Cadastro" onPress={nextStep} />
        </View>
      );
      case 5: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Documentação</Text>
          <Text style={{ color: currentTheme.textSecondary, marginBottom: 20 }}>
            Tire fotos nítidas para agilizar sua aprovação.
          </Text>

          <ImageSelector 
            label="RG ou CNH (Frente)" 
            onImageSelected={(uri) => console.log('Frente:', uri)} 
          />
          
          <ImageSelector 
            label="RG ou CNH (Verso)" 
            onImageSelected={(uri) => console.log('Verso:', uri)} 
          />

          <ImageSelector 
            label="Selfie segurando documento" 
            onImageSelected={(uri) => console.log('Selfie:', uri)} 
          />

          <View style={styles.infoBox}>
            <Ionicons name="alert-circle" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: currentTheme.text }]}>
              Seus dados são criptografados e usados apenas para verificação.
            </Text>
          </View>

          <Button title="Enviar para Análise" onPress={nextStep} />
        </View>
      );
    }
  }

  // --- FLUXO DO TÉCNICO ---
  function renderTechSteps() {
    switch(step) {
      case 1: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Tipo de Perfil</Text>
          <View style={styles.switchRow}>
            <Text style={{color: currentTheme.text}}>Pessoa Física</Text>
            <Switch value={isPJ} onValueChange={setIsPJ} trackColor={{true: colors.primary}} />
            <Text style={{color: currentTheme.text}}>Pessoa Jurídica</Text>
          </View>
          <Input placeholder={isPJ ? "Razão Social" : "Nome Completo"} />
          <Input placeholder={isPJ ? "CNPJ" : "CPF"} />
          <Button title="Próximo" onPress={nextStep} />
        </View>
      );
      case 2: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Contato e Acesso</Text>
          <Input placeholder="E-mail Profissional" />
          <Input placeholder="WhatsApp Comercial" />
          <Input placeholder="Senha" secureTextEntry />
          <Button title="Próximo" onPress={nextStep} />
        </View>
      );
      case 3: return (
      <View>
        <Text style={[styles.title, { color: currentTheme.text }]}>Área de Atuação</Text>
        
        <Input 
          placeholder="CEP da sua base operacional" 
          keyboardType="numeric"
          maxLength={8}
          onChangeText={handleCepChange} // Reaproveita a lógica de CEP que criamos para o cliente
        />

        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <Text style={{ color: currentTheme.text, fontSize: 16 }}>
            Raio de atendimento: 
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}> {radius === 100 ? 'Ilimitado' : `${radius} km`}</Text>
          </Text>
          
          <Slider
            style={{ width: '100%', height: 40, marginTop: 10 }}
            minimumValue={5}
            maximumValue={100}
            step={5}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={currentTheme.border}
            thumbTintColor={colors.primary}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: currentTheme.textSecondary, fontSize: 12 }}>5 km</Text>
            <Text style={{ color: currentTheme.textSecondary, fontSize: 12 }}>Ilimitado</Text>
          </View>
        </View>

        <Text style={{ color: currentTheme.text, marginBottom: 15, fontWeight: '600' }}>Modalidade de Atendimento:</Text>
        <View style={styles.modalidadeRow}>
          <TouchableOpacity 
            style={[styles.miniCard, modalidade === 'presencial' && styles.selectedCard]} 
            onPress={() => setModalidade('presencial')}
          >
            <Text style={{ color: modalidade === 'presencial' ? colors.primary : currentTheme.text }}>Presencial</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.miniCard, modalidade === 'remoto' && styles.selectedCard]} 
            onPress={() => setModalidade('remoto')}
          >
            <Text style={{ color: modalidade === 'remoto' ? colors.primary : currentTheme.text }}>Remoto</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.miniCard, modalidade === 'ambos' && styles.selectedCard]} 
            onPress={() => setModalidade('ambos')}
          >
            <Text style={{ color: modalidade === 'ambos' ? colors.primary : currentTheme.text }}>Ambos</Text>
          </TouchableOpacity>
        </View>

        <Button title="Próximo" onPress={nextStep} />
      </View>
    );
      case 4: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Especialidades</Text>
          <Text style={{ color: currentTheme.textSecondary, marginBottom: 20 }}>
            Quais serviços você está apto a realizar?
          </Text>

          <CategoryCard 
            title="Manutenção de Computadores" 
            icon="desktop-outline"
            selected={selectedSpecs.includes('PC')}
            onPress={() => toggleSpec('PC')}
          />
          
          <CategoryCard 
            title="Celulares e Tablets" 
            icon="phone-portrait-outline"
            selected={selectedSpecs.includes('Mobile')}
            onPress={() => toggleSpec('Mobile')}
          />

          <CategoryCard 
            title="Redes e Internet" 
            icon="wifi-outline"
            selected={selectedSpecs.includes('Net')}
            onPress={() => toggleSpec('Net')}
          />

          <CategoryCard 
            title="Automação Residencial" 
            icon="home-outline"
            selected={selectedSpecs.includes('Home')}
            onPress={() => toggleSpec('Home')}
          />

          <Button title="Próximo" onPress={nextStep} />
        </View>
      );
      case 5: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Documentação</Text>
          <Text style={{color: currentTheme.textSecondary, marginBottom: 20}}>Precisamos validar sua identidade.</Text>
          <Button title="Upload RG/CNH" type="secondary" onPress={() => {}} />
          <Button title="Selfie com Documento" type="secondary" onPress={() => {}} />
          <Button title="Enviar para Análise" onPress={nextStep} />
        </View>
      );
      case 6: return (
        <View>
          <Text style={[styles.title, { color: currentTheme.text }]}>Dados Bancários</Text>
          <Text style={{ color: currentTheme.textSecondary, marginBottom: 20 }}>
            Onde você deseja receber o pagamento pelos seus serviços?
          </Text>

          <Input placeholder="Instituição Bancária (Ex: NuBank, Itaú)" />
          
          <View style={styles.switchRow}>
            <Text style={{color: currentTheme.text, fontWeight: '600'}}>Tipo de Conta:</Text>
            <Text style={{color: colors.primary}}>Corrente</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: currentTheme.text, marginBottom: 8, fontWeight: '500' }}>Chave PIX</Text>
            <Input placeholder="CPF, E-mail, Celular ou Chave Aleatória" />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Input placeholder="Agência" keyboardType="numeric" /></View>
            <View style={{ flex: 2 }}><Input placeholder="Conta com Dígito" keyboardType="numeric" /></View>
          </View>

          <Button title="Salvar e Finalizar" onPress={nextStep} />
        </View>
      );
      case 7: return (
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 40 }}>
          <View style={styles.iconCircle}>
            <Ionicons name="time-outline" size={60} color={colors.primary} />
          </View>
          
          <Text style={[styles.title, { color: currentTheme.text, marginTop: 24, textAlign: 'center' }]}>
            Perfil em Análise
          </Text>
          
          <Text style={{ color: currentTheme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 30 }}>
            Recebemos suas informações! Nosso time de segurança validará seus documentos em até <Text style={{fontWeight: 'bold', color: currentTheme.text}}>48h úteis</Text>.
          </Text>

          <View style={[styles.card, { backgroundColor: colors.primary + '10', borderWidth: 0 }]}>
            <Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 5 }}>O que você pode fazer agora?</Text>
            <Text style={{ color: currentTheme.textSecondary, fontSize: 13 }}>
              • Explorar o dashboard{'\n'}
              • Completar sua bio profissional{'\n'}
              • Configurar notificações por SMS
            </Text>
          </View>
          <Button 
            title="Explorar a Plataforma" 
            onPress={() => navigation.replace('MainTabs')} 
          />
          
          <TouchableOpacity style={{ marginTop: 20 }}>
            <Text style={{ color: currentTheme.textSecondary }}>Dúvidas? <Text style={{ color: colors.primary }}>Falar com suporte</Text></Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  // --- SELEÇÃO DE PERFIL ---
  function SelectionScreen() {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: currentTheme.text, fontSize: 32 }]}>TECH<Text style={{color: colors.primary}}>NAVEIA</Text></Text>
          <Text style={{color: currentTheme.textSecondary, marginBottom: 40, textAlign: 'center'}}>Escolha o seu perfil para começar</Text>
          
          <TouchableOpacity style={styles.card} onPress={() => setUserType('client')}>
             <Ionicons name="person-add" size={32} color={colors.primary} />
             <Text style={[styles.cardTitle, {color: currentTheme.text}]}>Sou Cliente</Text>
             <Text style={{color: currentTheme.textSecondary, textAlign: 'center'}}>Busco ajuda tecnológica rápida</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setUserType('tech')}>
             <Ionicons name="construct" size={32} color={colors.primary} />
             <Text style={[styles.cardTitle, {color: currentTheme.text}]}>Sou Técnico</Text>
             <Text style={{color: currentTheme.textSecondary, textAlign: 'center'}}>Quero prestar serviços e lucrar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 24, paddingBottom: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  stepIndicator: { fontSize: 14, fontWeight: 'bold' },
  card: { width: '100%', padding: 25, borderRadius: 20, backgroundColor: '#00000005', borderWidth: 1, borderColor: '#00000010', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: 10, backgroundColor: '#00000005', borderRadius: 12 },
  modalidadeRow: {  flexDirection: 'row',  justifyContent: 'space-between', gap: 8, marginBottom: 30 },
  checkItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#00000005', borderRadius: 12, marginBottom: 10 },
  infoBox: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#00000005', borderRadius: 12, marginVertical: 20 },
  infoText: { flex: 1, marginLeft: 10, fontSize: 14 },
  miniCard: {  flex: 1,  height: 50,  borderRadius: 12, borderWidth: 1, borderColor: '#D0D9ED', justifyContent: 'center', alignItems: 'center',  backgroundColor: '#00000005',},
  selectedCard: {  borderColor: colors.primary, backgroundColor: colors.primary + '15'},
  iconCircle: {  width: 120,  height: 120, borderRadius: 60, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
});