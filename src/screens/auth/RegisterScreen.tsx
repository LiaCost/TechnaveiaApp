import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Switch, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api';
import { fetchAddressByCep } from '../../services/addressService';
import { ImageSelector } from '../../components/ImageSelector';

// ─── Tipos ────────────────────────────────────────────────

type ProfileType = 'client' | 'tech' | null;
type TipoPessoa = 'pf' | 'pj';
type Modalidade = 'presencial' | 'remoto' | 'ambos';

interface ClientData {
  nome: string; cpf: string; nascimento: string;
  email: string; telefone: string;
  cep: string; rua: string; numero: string;
  complemento: string; bairro: string; cidade: string; estado: string;
  senha: string; confirmaSenha: string;
  aceitaTermos: boolean; aceitaEmail: boolean;
}

interface TechData {
  tipoPessoa: TipoPessoa;
  nome: string; cpfCnpj: string; dataNascAbertura: string;
  email: string; telefone: string; whatsapp: string;
  senha: string; confirmaSenha: string;
  cep: string; rua: string; numero: string;
  complemento: string; bairro: string; cidade: string; estado: string;
  raioAtendimento: number;
  modalidade: Modalidade;
  especialidades: string[];
  docFrente: string; docVerso: string;
  selfie: string; comprovanteResidencia: string;
  certificados: string; fotoPerfil: string;
  banco: string; tipoConta: 'corrente' | 'poupanca' | 'pix';
  chavePix: string; agencia: string; conta: string;
}

const ESPECIALIDADES = [
  { id: 'pc',         label: 'Manutenção de Computadores',       icon: 'desktop-outline' },
  { id: 'celular',    label: 'Manutenção de Celulares/Tablets',  icon: 'phone-portrait-outline' },
  { id: 'redes',      label: 'Redes e Internet',                 icon: 'wifi-outline' },
  { id: 'automacao',  label: 'Automação Residencial',            icon: 'home-outline' },
  { id: 'cftv',       label: 'Segurança Eletrônica (CFTV)',      icon: 'videocam-outline' },
  { id: 'remoto',     label: 'Suporte Remoto',                   icon: 'laptop-outline' },
  { id: 'impressora', label: 'Impressoras e Periféricos',        icon: 'print-outline' },
  { id: 'tv',         label: 'Smart TV e Home Theater',          icon: 'tv-outline' },
  { id: 'ti',         label: 'Desenvolvimento / TI Corporativo', icon: 'code-slash-outline' },
  { id: 'outros',     label: 'Outros',                           icon: 'grid-outline' },
];

const RAIOS = [5, 10, 20, 50, 0]; // 0 = ilimitado

// ─── Helpers ──────────────────────────────────────────────

function passwordStrength(pwd: string): { level: 0|1|2|3; label: string; color: string } {
  if (pwd.length < 6) return { level: 0, label: '', color: '#EEE' };
  const score = [pwd.length >= 8, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;
  if (score <= 1) return { level: 1, label: 'Fraca',  color: '#F44336' };
  if (score === 2) return { level: 2, label: 'Média',  color: '#FF9800' };
  return              { level: 3, label: 'Forte',  color: '#4CAF50' };
}

const fmt = {
  cpf:   (v: string) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2'),
  cnpj:  (v: string) => v.replace(/\D/g,'').slice(0,14).replace(/(\d{2})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1/$2').replace(/(\d{4})(\d{1,2})$/,'$1-$2'),
  phone: (v: string) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2'),
  cep:   (v: string) => v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2'),
  date:  (v: string) => { const c = v.replace(/\D/g,'').slice(0,8); return c.replace(/(\d{2})(\d)/,'$1/$2').replace(/(\d{2})(\d)/,'$1/$2'); },
};

// ─── Sub-componentes ──────────────────────────────────────

function StepField({ label, placeholder, value, onChangeText, keyboardType, secureTextEntry, maxLength, editable = true }: any) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={[f.input, !editable && f.disabled]}
        placeholder={placeholder} placeholderTextColor="#AAA"
        value={value} onChangeText={onChangeText}
        keyboardType={keyboardType} secureTextEntry={secureTextEntry}
        maxLength={maxLength} editable={editable} autoCapitalize="none"
      />
    </View>
  );
}

const f = StyleSheet.create({
  wrap:     { marginBottom: 16 },
  label:    { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input:    { backgroundColor: '#F8F9FF', borderWidth: 1, borderColor: '#E0E4F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111' },
  disabled: { backgroundColor: '#F0F0F0' },
});

function StepHeader({ step, total, title, sub, onBack }: any) {
  return (
    <>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.dark1} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Cadastro Técnico</Text>
        <Text style={s.stepCounter}>{step}/{total}</Text>
      </View>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${(step / total) * 100}%` }]} />
      </View>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={s.stepTitle}>{title}</Text>
        <Text style={s.stepSub}>{sub}</Text>
      </View>
    </>
  );
}

function NextBtn({ label, onPress, loading = false }: any) {
  return (
    <View style={s.footer}>
      <TouchableOpacity style={s.nextBtn} onPress={onPress} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : (
          <>
            <Text style={s.nextBtnText}>{label ?? 'Próximo'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Tela principal ────────────────────────────────────────

export function RegisterScreen({ navigation }: any) {
  const { signIn } = useAuth();

  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [step, setStep]               = useState(0);
  const [isSending, setIsSending]     = useState(false);
  const [cepLoading, setCepLoading]   = useState(false);

  // ── Dados cliente ──
  const [cd, setCd] = useState<ClientData>({
    nome: '', cpf: '', nascimento: '', email: '', telefone: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
    senha: '', confirmaSenha: '', aceitaTermos: false, aceitaEmail: false,
  });
  const setC = (k: keyof ClientData, v: any) => setCd(p => ({ ...p, [k]: v }));

  // ── Dados técnico ──
  const [td, setTd] = useState<TechData>({
    tipoPessoa: 'pf', nome: '', cpfCnpj: '', dataNascAbertura: '',
    email: '', telefone: '', whatsapp: '',
    senha: '', confirmaSenha: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
    raioAtendimento: 10, modalidade: 'presencial', especialidades: [],
    docFrente: '', docVerso: '', selfie: '', comprovanteResidencia: '', certificados: '', fotoPerfil: '',
    banco: '', tipoConta: 'pix', chavePix: '', agencia: '', conta: '',
  });
  const setT = (k: keyof TechData, v: any) => setTd(p => ({ ...p, [k]: v }));

  function goBack() {
    if (step === 0) navigation.goBack();
    else setStep(s => s - 1);
  }

  // ── Busca CEP (reutilizável) ──
  async function handleCEP(raw: string, setter: (k: any, v: any) => void) {
    setter('cep', fmt.cep(raw));
    const clean = raw.replace(/\D/g, '');
    if (clean.length === 8) {
      setCepLoading(true);
      const addr = await fetchAddressByCep(clean);
      if (addr) {
        setter('rua', addr.logradouro);
        setter('bairro', addr.bairro);
        setter('cidade', addr.localidade);
        setter('estado', addr.uf);
      } else {
        Alert.alert('CEP não encontrado', 'Verifique e tente novamente.');
      }
      setCepLoading(false);
    }
  }

  // ── Validações cliente ──
  function validateClient(): boolean {
    if (step === 1) {
      if (!cd.nome.trim())                              { Alert.alert('Nome obrigatório'); return false; }
      if (cd.cpf.replace(/\D/g,'').length !== 11)      { Alert.alert('CPF inválido');     return false; }
    }
    if (step === 2) {
      if (!cd.email.includes('@'))                      { Alert.alert('E-mail inválido');  return false; }
      if (cd.telefone.replace(/\D/g,'').length < 10)   { Alert.alert('Telefone inválido');return false; }
    }
    if (step === 3) {
      if (cd.cep.replace(/\D/g,'').length !== 8)       { Alert.alert('CEP inválido');     return false; }
      if (!cd.rua.trim() || !cd.numero.trim())         { Alert.alert('Preencha rua e número'); return false; }
    }
    if (step === 4) {
      if (cd.senha.length < 6)                         { Alert.alert('Senha muito curta'); return false; }
      if (cd.senha !== cd.confirmaSenha)               { Alert.alert('Senhas não coincidem'); return false; }
      if (!cd.aceitaTermos)                            { Alert.alert('Aceite os termos'); return false; }
    }
    return true;
  }

  // ── Validações técnico ──
  function validateTech(): boolean {
    if (step === 1) {
      if (!td.nome.trim())                             { Alert.alert('Nome obrigatório');  return false; }
      const docLen = td.cpfCnpj.replace(/\D/g,'').length;
      if (td.tipoPessoa === 'pf' && docLen !== 11)     { Alert.alert('CPF inválido');      return false; }
      if (td.tipoPessoa === 'pj' && docLen !== 14)     { Alert.alert('CNPJ inválido');     return false; }
    }
    if (step === 2) {
      if (!td.email.includes('@'))                     { Alert.alert('E-mail inválido');   return false; }
      if (td.senha.length < 6)                         { Alert.alert('Senha muito curta'); return false; }
      if (td.senha !== td.confirmaSenha)               { Alert.alert('Senhas não coincidem'); return false; }
    }
    if (step === 3) {
      if (td.cep.replace(/\D/g,'').length !== 8)      { Alert.alert('CEP inválido');      return false; }
    }
    if (step === 4) {
      if (td.especialidades.length === 0)              { Alert.alert('Selecione ao menos uma especialidade'); return false; }
    }
    if (step === 6) {
      if (!td.chavePix.trim() && !td.conta.trim())     { Alert.alert('Informe sua chave PIX ou dados bancários'); return false; }
    }
    return true;
  }

  const strengthC = passwordStrength(cd.senha);
  const strengthT = passwordStrength(td.senha);

  // ════════════════════════════════════════
  // ETAPA 0: Seleção de perfil
  // ════════════════════════════════════════
  if (step === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.dark1} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Criar conta</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.profileSection}>
          <Text style={s.profileTitle}>Qual é o seu perfil?</Text>
          <Text style={s.profileSub}>Escolha como você vai usar a TECHNAVEIA</Text>

          {(['client', 'tech'] as ProfileType[]).map(type => (
            <TouchableOpacity
              key={type!}
              style={[s.profileCard, profileType === type && s.profileCardActive]}
              onPress={() => setProfileType(type)}
            >
              <View style={[s.profileIcon, profileType === type && s.profileIconActive]}>
                <Ionicons
                  name={type === 'client' ? 'person' : 'construct'}
                  size={28}
                  color={profileType === type ? '#FFF' : colors.primary}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[s.profileCardTitle, profileType === type && { color: colors.primary }]}>
                  {type === 'client' ? 'Sou Cliente' : 'Sou Técnico / Prestador'}
                </Text>
                <Text style={s.profileCardSub}>
                  {type === 'client' ? 'Preciso de suporte técnico' : 'Quero oferecer serviços'}
                </Text>
              </View>
              <Ionicons
                name={profileType === type ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={profileType === type ? colors.primary : '#CCC'}
              />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[s.nextBtn, !profileType && s.nextBtnDisabled]}
            onPress={() => { if (profileType) setStep(1); }}
          >
            <Text style={s.nextBtnText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════
  // FLUXO CLIENTE (etapas 1–5)
  // ════════════════════════════════════════
  if (profileType === 'client') {
    const TOTAL = 4;

    const finishClient = async () => {
      setIsSending(true);
      try {
        const response = await authService.register({
          nome: cd.nome,
          cpf: cd.cpf,
          email: cd.email,
          telefone: cd.telefone,
          senha: cd.senha,
          endereco: {
            cep: cd.cep, rua: cd.rua, numero: cd.numero,
            complemento: cd.complemento, bairro: cd.bairro,
            cidade: cd.cidade, estado: cd.estado,
          },
        });
        await signIn(response.token, response.userType, response.user);
      } catch (error: any) {
        Alert.alert('Erro', error.message ?? 'Não foi possível criar sua conta.');
        setIsSending(false);
      }
    };

    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={goBack} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.dark1} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Cadastro</Text>
          <Text style={s.stepCounter}>{step}/{TOTAL}</Text>
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${(step / TOTAL) * 100}%` }]} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

            {step === 1 && (
              <View>
                <Text style={s.stepTitle}>Dados pessoais</Text>
                <Text style={s.stepSub}>Precisamos confirmar quem você é</Text>
                <StepField label="Nome completo" placeholder="Seu nome completo" value={cd.nome} onChangeText={(v: string) => setC('nome', v)} />
                <StepField label="CPF" placeholder="000.000.000-00" value={cd.cpf} onChangeText={(v: string) => setC('cpf', fmt.cpf(v))} keyboardType="numeric" maxLength={14} />
                <StepField label="Data de nascimento" placeholder="DD/MM/AAAA" value={cd.nascimento} onChangeText={(v: string) => setC('nascimento', fmt.date(v))} keyboardType="numeric" maxLength={10} />
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={s.stepTitle}>Contato</Text>
                <Text style={s.stepSub}>Usamos para enviar confirmações e alertas</Text>
                <StepField label="E-mail" placeholder="seu@email.com" value={cd.email} onChangeText={(v: string) => setC('email', v)} keyboardType="email-address" />
                <StepField label="Celular" placeholder="(00) 00000-0000" value={cd.telefone} onChangeText={(v: string) => setC('telefone', fmt.phone(v))} keyboardType="phone-pad" maxLength={15} />
                <View style={s.infoBox}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                  <Text style={s.infoText}>Um código de verificação será enviado por SMS para confirmar seu número.</Text>
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={s.stepTitle}>Endereço principal</Text>
                <Text style={s.stepSub}>Para encontrarmos técnicos perto de você</Text>
                <View style={f.wrap}>
                  <Text style={f.label}>CEP</Text>
                  <View style={s.cepRow}>
                    <TextInput style={[f.input, { flex: 1 }]} placeholder="00000-000" placeholderTextColor="#AAA" value={cd.cep} onChangeText={v => handleCEP(v, setC)} keyboardType="numeric" maxLength={9} />
                    {cepLoading && <ActivityIndicator color={colors.primary} style={{ marginLeft: 12 }} />}
                  </View>
                </View>
                <StepField label="Rua / Logradouro" placeholder="Nome da rua" value={cd.rua} onChangeText={(v: string) => setC('rua', v)} editable={!cepLoading} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}><StepField label="Número" placeholder="123" value={cd.numero} onChangeText={(v: string) => setC('numero', v)} keyboardType="numeric" /></View>
                  <View style={{ flex: 2 }}><StepField label="Complemento" placeholder="Apto (opcional)" value={cd.complemento} onChangeText={(v: string) => setC('complemento', v)} /></View>
                </View>
                <StepField label="Bairro" placeholder="Bairro" value={cd.bairro} onChangeText={(v: string) => setC('bairro', v)} editable={!cepLoading} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 2 }}><StepField label="Cidade" placeholder="Cidade" value={cd.cidade} onChangeText={(v: string) => setC('cidade', v)} editable={!cepLoading} /></View>
                  <View style={{ flex: 1 }}><StepField label="UF" placeholder="SP" value={cd.estado} onChangeText={(v: string) => setC('estado', v.toUpperCase().slice(0,2))} maxLength={2} editable={!cepLoading} /></View>
                </View>
              </View>
            )}

            {step === 4 && (
              <View>
                <Text style={s.stepTitle}>Crie sua senha</Text>
                <Text style={s.stepSub}>Use letras, números e símbolos para uma senha forte</Text>
                <View style={f.wrap}>
                  <Text style={f.label}>Senha</Text>
                  <TextInput style={f.input} placeholder="Mínimo 6 caracteres" placeholderTextColor="#AAA" secureTextEntry value={cd.senha} onChangeText={v => setC('senha', v)} />
                  {cd.senha.length > 0 && (
                    <View style={s.strengthRow}>
                      {[1,2,3].map(l => <View key={l} style={[s.strengthBar, { backgroundColor: strengthC.level >= l ? strengthC.color : '#E0E0E0' }]} />)}
                      <Text style={[s.strengthLabel, { color: strengthC.color }]}>{strengthC.label}</Text>
                    </View>
                  )}
                </View>
                <StepField label="Confirmar senha" placeholder="Repita a senha" value={cd.confirmaSenha} onChangeText={(v: string) => setC('confirmaSenha', v)} secureTextEntry />
                {cd.confirmaSenha.length > 0 && cd.senha !== cd.confirmaSenha && (
                  <View style={s.errorBox}><Ionicons name="alert-circle-outline" size={16} color="#F44336" /><Text style={s.errorText}>As senhas não coincidem</Text></View>
                )}
                <View style={s.termsSection}>
                  <TouchableOpacity style={s.checkRow} onPress={() => setC('aceitaTermos', !cd.aceitaTermos)}>
                    <Ionicons name={cd.aceitaTermos ? 'checkbox' : 'square-outline'} size={22} color={cd.aceitaTermos ? colors.primary : '#CCC'} />
                    <Text style={s.checkText}>Aceito os <Text style={s.link}>Termos de Uso</Text> e a <Text style={s.link}>Política de Privacidade</Text></Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.checkRow} onPress={() => setC('aceitaEmail', !cd.aceitaEmail)}>
                    <Ionicons name={cd.aceitaEmail ? 'checkbox' : 'square-outline'} size={22} color={cd.aceitaEmail ? colors.primary : '#CCC'} />
                    <Text style={s.checkText}>Desejo receber ofertas e novidades (opcional)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 5 && (
              <View style={s.successScreen}>
                <View style={s.successIcon}><Ionicons name="checkmark-circle" size={64} color={colors.primary} /></View>
                <Text style={s.successTitle}>Bem-vindo, {cd.nome.split(' ')[0]}!</Text>
                <Text style={s.successSub}>Sua conta foi criada com sucesso. Agora você pode solicitar serviços técnicos na TECHNAVEIA.</Text>
                <TouchableOpacity style={s.nextBtn} onPress={finishClient} disabled={isSending}>
                  {isSending ? <ActivityIndicator color="#FFF" /> : <><Text style={s.nextBtnText}>Explorar a plataforma</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></>}
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>

        {step >= 1 && step <= 4 && (
          <NextBtn
            label={step === 4 ? 'Finalizar Cadastro' : 'Próximo'}
            onPress={() => { if (validateClient()) setStep(step === 4 ? 5 : step + 1); }}
          />
        )}
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════
  // FLUXO TÉCNICO (etapas 1–7)
  // ════════════════════════════════════════
  const TOTAL_TECH = 7;

  const finishTech = async () => {
    setIsSending(true);
    try {
      const response = await authService.register({
        nome: td.nome,
        cpf: td.cpfCnpj,
        email: td.email,
        telefone: td.telefone,
        senha: td.senha,
        role: 'tecnico',
        endereco: {
          cep: td.cep, rua: td.rua, numero: td.numero,
          complemento: td.complemento, bairro: td.bairro,
          cidade: td.cidade, estado: td.estado,
        },
      } as any);
      await signIn(response.token, response.userType, response.user);
    } catch (error: any) {
      Alert.alert('Erro', error.message ?? 'Não foi possível concluir o cadastro.');
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}>

          {/* Header fixo */}
          <View>
            <StepHeader
              step={step} total={TOTAL_TECH}
              title={[
                '', 'Tipo de pessoa', 'Contato e acesso',
                'Localização e atuação', 'Especialidades',
                'Documentação', 'Dados bancários', 'Cadastro enviado!',
              ][step]}
              sub={[
                '', 'Informe seus dados básicos', 'Como você será contactado e acessará a plataforma',
                'Onde e como você atende', 'Quais serviços você oferece',
                'Envie seus documentos para verificação', 'Para onde vamos depositar seus ganhos',
                '',
              ][step]}
              onBack={goBack}
            />
          </View>

          {/* ── Etapa 1: Tipo de pessoa ── */}
          {step === 1 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <Text style={s.fieldLabel}>Tipo de cadastro</Text>
              <View style={s.tipoPessoaRow}>
                {(['pf', 'pj'] as TipoPessoa[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[s.tipoCard, td.tipoPessoa === t && s.tipoCardActive]}
                    onPress={() => setT('tipoPessoa', t)}
                  >
                    <Ionicons name={t === 'pf' ? 'person-outline' : 'business-outline'} size={22} color={td.tipoPessoa === t ? colors.primary : '#888'} />
                    <Text style={[s.tipoLabel, td.tipoPessoa === t && { color: colors.primary }]}>{t === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}</Text>
                    <Text style={s.tipoSub}>{t === 'pf' ? 'CPF' : 'CNPJ'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <StepField
                label={td.tipoPessoa === 'pf' ? 'Nome completo' : 'Razão Social'}
                placeholder={td.tipoPessoa === 'pf' ? 'Seu nome completo' : 'Nome da empresa'}
                value={td.nome} onChangeText={(v: string) => setT('nome', v)}
              />
              <StepField
                label={td.tipoPessoa === 'pf' ? 'CPF' : 'CNPJ'}
                placeholder={td.tipoPessoa === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'}
                value={td.cpfCnpj}
                onChangeText={(v: string) => setT('cpfCnpj', td.tipoPessoa === 'pf' ? fmt.cpf(v) : fmt.cnpj(v))}
                keyboardType="numeric"
                maxLength={td.tipoPessoa === 'pf' ? 14 : 18}
              />
              <StepField
                label={td.tipoPessoa === 'pf' ? 'Data de nascimento' : 'Data de abertura'}
                placeholder="DD/MM/AAAA"
                value={td.dataNascAbertura}
                onChangeText={(v: string) => setT('dataNascAbertura', fmt.date(v))}
                keyboardType="numeric" maxLength={10}
              />
            </View>
          )}

          {/* ── Etapa 2: Contato e acesso ── */}
          {step === 2 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <StepField label="E-mail profissional" placeholder="seu@email.com" value={td.email} onChangeText={(v: string) => setT('email', v)} keyboardType="email-address" />
              <StepField label="Telefone comercial" placeholder="(00) 00000-0000" value={td.telefone} onChangeText={(v: string) => setT('telefone', fmt.phone(v))} keyboardType="phone-pad" maxLength={15} />
              <StepField label="WhatsApp (opcional)" placeholder="(00) 00000-0000" value={td.whatsapp} onChangeText={(v: string) => setT('whatsapp', fmt.phone(v))} keyboardType="phone-pad" maxLength={15} />

              <View style={f.wrap}>
                <Text style={f.label}>Senha</Text>
                <TextInput style={f.input} placeholder="Mínimo 6 caracteres" placeholderTextColor="#AAA" secureTextEntry value={td.senha} onChangeText={v => setT('senha', v)} />
                {td.senha.length > 0 && (
                  <View style={s.strengthRow}>
                    {[1,2,3].map(l => <View key={l} style={[s.strengthBar, { backgroundColor: strengthT.level >= l ? strengthT.color : '#E0E0E0' }]} />)}
                    <Text style={[s.strengthLabel, { color: strengthT.color }]}>{strengthT.label}</Text>
                  </View>
                )}
              </View>
              <StepField label="Confirmar senha" placeholder="Repita a senha" value={td.confirmaSenha} onChangeText={(v: string) => setT('confirmaSenha', v)} secureTextEntry />
              {td.confirmaSenha.length > 0 && td.senha !== td.confirmaSenha && (
                <View style={s.errorBox}><Ionicons name="alert-circle-outline" size={16} color="#F44336" /><Text style={s.errorText}>As senhas não coincidem</Text></View>
              )}
            </View>
          )}

          {/* ── Etapa 3: Localização e atuação ── */}
          {step === 3 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <View style={f.wrap}>
                <Text style={f.label}>CEP</Text>
                <View style={s.cepRow}>
                  <TextInput style={[f.input, { flex: 1 }]} placeholder="00000-000" placeholderTextColor="#AAA" value={td.cep} onChangeText={v => handleCEP(v, setT)} keyboardType="numeric" maxLength={9} />
                  {cepLoading && <ActivityIndicator color={colors.primary} style={{ marginLeft: 12 }} />}
                </View>
              </View>
              <StepField label="Rua / Logradouro" placeholder="Nome da rua" value={td.rua} onChangeText={(v: string) => setT('rua', v)} editable={!cepLoading} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}><StepField label="Número" placeholder="123" value={td.numero} onChangeText={(v: string) => setT('numero', v)} keyboardType="numeric" /></View>
                <View style={{ flex: 2 }}><StepField label="Complemento" placeholder="Sala, andar (opcional)" value={td.complemento} onChangeText={(v: string) => setT('complemento', v)} /></View>
              </View>
              <StepField label="Bairro" placeholder="Bairro" value={td.bairro} onChangeText={(v: string) => setT('bairro', v)} editable={!cepLoading} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 2 }}><StepField label="Cidade" placeholder="Cidade" value={td.cidade} onChangeText={(v: string) => setT('cidade', v)} editable={!cepLoading} /></View>
                <View style={{ flex: 1 }}><StepField label="UF" placeholder="SP" value={td.estado} onChangeText={(v: string) => setT('estado', v.toUpperCase().slice(0,2))} maxLength={2} editable={!cepLoading} /></View>
              </View>

              <Text style={s.fieldLabel}>Raio de atendimento</Text>
              <View style={s.raioRow}>
                {RAIOS.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[s.raioChip, td.raioAtendimento === r && s.raioChipActive]}
                    onPress={() => setT('raioAtendimento', r)}
                  >
                    <Text style={[s.raioText, td.raioAtendimento === r && { color: '#FFF' }]}>
                      {r === 0 ? 'Ilimitado' : `${r}km`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.fieldLabel}>Modalidade de atendimento</Text>
              <View style={s.modalRow}>
                {([['presencial','Presencial','person-outline'],['remoto','Remoto','laptop-outline'],['ambos','Ambos','swap-horizontal-outline']] as const).map(([val, label, icon]) => (
                  <TouchableOpacity
                    key={val}
                    style={[s.modalChip, td.modalidade === val && s.modalChipActive]}
                    onPress={() => setT('modalidade', val)}
                  >
                    <Ionicons name={icon} size={16} color={td.modalidade === val ? '#FFF' : '#666'} />
                    <Text style={[s.modalText, td.modalidade === val && { color: '#FFF' }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Etapa 4: Especialidades ── */}
          {step === 4 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <Text style={s.stepSub}>Selecione todas as áreas em que você atende</Text>
              {ESPECIALIDADES.map(esp => {
                const selected = td.especialidades.includes(esp.id);
                return (
                  <TouchableOpacity
                    key={esp.id}
                    style={[s.espCard, selected && s.espCardActive]}
                    onPress={() => {
                      setT('especialidades',
                        selected
                          ? td.especialidades.filter(e => e !== esp.id)
                          : [...td.especialidades, esp.id]
                      );
                    }}
                  >
                    <View style={s.espLeft}>
                      <Ionicons name={esp.icon as any} size={22} color={selected ? colors.primary : '#888'} />
                      <Text style={[s.espLabel, selected && { color: colors.primary }]}>{esp.label}</Text>
                    </View>
                    <Ionicons name={selected ? 'checkbox' : 'square-outline'} size={22} color={selected ? colors.primary : '#CCC'} />
                  </TouchableOpacity>
                );
              })}
              <View style={s.infoBox}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                <Text style={s.infoText}>Você pode adicionar ou remover especialidades depois nas configurações do perfil.</Text>
              </View>
            </View>
          )}

          {/* ── Etapa 5: Documentação ── */}
          {step === 5 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <View style={s.warningBox}>
                <Ionicons name="time-outline" size={18} color="#856404" />
                <Text style={s.warningText}>Prazo de análise: até 48h úteis após o envio.</Text>
              </View>

              <Text style={s.fieldLabel}>RG ou CNH — Frente <Text style={s.required}>*</Text></Text>
              <ImageSelector label="Toque para enviar a frente do documento" onImageSelected={uri => setT('docFrente', uri)} />

              <Text style={s.fieldLabel}>RG ou CNH — Verso <Text style={s.required}>*</Text></Text>
              <ImageSelector label="Toque para enviar o verso do documento" onImageSelected={uri => setT('docVerso', uri)} />

              <Text style={s.fieldLabel}>Selfie com o documento <Text style={s.required}>*</Text></Text>
              <ImageSelector label="Segure o documento ao lado do rosto" onImageSelected={uri => setT('selfie', uri)} />

              <Text style={s.fieldLabel}>Comprovante de residência <Text style={s.required}>*</Text></Text>
              <ImageSelector label="Conta de luz, água ou internet" onImageSelected={uri => setT('comprovanteResidencia', uri)} />

              <Text style={s.fieldLabel}>Foto de perfil profissional <Text style={s.required}>*</Text></Text>
              <ImageSelector label="Foto clara, fundo neutro" onImageSelected={uri => setT('fotoPerfil', uri)} />

              <Text style={s.fieldLabel}>Certificados e qualificações <Text style={s.optional}>(opcional — recomendado)</Text></Text>
              <ImageSelector label="Diplomas, certificações, cursos" onImageSelected={uri => setT('certificados', uri)} />

              <View style={s.infoBox}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
                <Text style={s.infoText}>Técnicos com documentação completa aparecem com o badge "Verificado" e recebem mais solicitações.</Text>
              </View>
            </View>
          )}

          {/* ── Etapa 6: Dados bancários ── */}
          {step === 6 && (
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <StepField label="Banco" placeholder="Ex: Nubank, Itaú, Bradesco..." value={td.banco} onChangeText={(v: string) => setT('banco', v)} />

              <Text style={s.fieldLabel}>Tipo de conta / recebimento</Text>
              <View style={s.contaRow}>
                {([['pix','PIX'],['corrente','Corrente'],['poupanca','Poupança']] as const).map(([val, label]) => (
                  <TouchableOpacity
                    key={val}
                    style={[s.contaChip, td.tipoConta === val && s.contaChipActive]}
                    onPress={() => setT('tipoConta', val)}
                  >
                    <Text style={[s.contaText, td.tipoConta === val && { color: '#FFF' }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {td.tipoConta === 'pix' && (
                <StepField label="Chave PIX" placeholder="CPF, e-mail, telefone ou chave aleatória" value={td.chavePix} onChangeText={(v: string) => setT('chavePix', v)} />
              )}

              {(td.tipoConta === 'corrente' || td.tipoConta === 'poupanca') && (
                <>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}><StepField label="Agência" placeholder="0000" value={td.agencia} onChangeText={(v: string) => setT('agencia', v)} keyboardType="numeric" /></View>
                    <View style={{ flex: 2 }}><StepField label="Conta (com dígito)" placeholder="00000-0" value={td.conta} onChangeText={(v: string) => setT('conta', v)} keyboardType="numeric" /></View>
                  </View>
                </>
              )}

              <View style={s.infoBox}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
                <Text style={s.infoText}>Seus dados bancários são criptografados e usados apenas para repasse dos seus ganhos.</Text>
              </View>
            </View>
          )}

          {/* ── Etapa 7: Aguardando aprovação ── */}
          {step === 7 && (
            <View style={s.waitingScreen}>
              <View style={s.waitingIcon}>
                <Ionicons name="hourglass-outline" size={52} color={colors.primary} />
              </View>
              <Text style={s.waitingTitle}>Cadastro enviado!</Text>
              <Text style={s.waitingSub}>Nossa equipe vai analisar seus documentos em até 48 horas úteis.</Text>

              <View style={s.waitingSteps}>
                {[
                  { icon: 'document-text-outline', label: 'Documentos recebidos', done: true },
                  { icon: 'search-outline',         label: 'Em análise pela equipe', done: false },
                  { icon: 'shield-checkmark-outline',label: 'Aprovação e badge verificado', done: false },
                ].map((item, i) => (
                  <View key={i} style={s.waitingStep}>
                    <View style={[s.waitingStepIcon, item.done && { backgroundColor: '#E8F5E9' }]}>
                      <Ionicons name={item.icon as any} size={18} color={item.done ? '#2E7D32' : '#AAA'} />
                    </View>
                    <Text style={[s.waitingStepText, item.done && { color: '#2E7D32', fontWeight: '600' }]}>{item.label}</Text>
                  </View>
                ))}
              </View>

              <View style={s.infoBox}>
                <Ionicons name="notifications-outline" size={18} color={colors.primary} />
                <Text style={s.infoText}>Você receberá um e-mail e uma notificação quando sua conta for aprovada.</Text>
              </View>

              <TouchableOpacity style={[s.nextBtn, { marginTop: 24 }]} onPress={finishTech} disabled={isSending}>
                {isSending ? <ActivityIndicator color="#FFF" /> : (
                  <><Text style={s.nextBtnText}>Ir para o Dashboard</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></>
                )}
              </TouchableOpacity>
              <Text style={s.waitingNote}>Acesso limitado até a aprovação ser concluída.</Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {step >= 1 && step <= 6 && (
        <NextBtn
          label={step === 6 ? 'Enviar para análise' : 'Próximo'}
          onPress={() => { if (validateTech()) setStep(step + 1); }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.dark1 },
  stepCounter: { fontSize: 13, color: colors.primary, fontWeight: '600', width: 40, textAlign: 'right' },

  progressBar: { height: 3, backgroundColor: '#E8EEFF' },
  progressFill: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },

  scroll: { paddingBottom: 40 },

  stepTitle: { fontSize: 22, fontWeight: '700', color: colors.dark1, marginBottom: 6 },
  stepSub:   { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
  fieldLabel:{ fontSize: 12, fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 6 },
  required:  { color: '#F44336' },
  optional:  { fontWeight: '400', textTransform: 'none', color: '#AAA' },

  cepRow: { flexDirection: 'row', alignItems: 'center' },

  strengthRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  strengthBar:  { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel:{ fontSize: 12, fontWeight: '600', width: 40 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF0F0', padding: 10, borderRadius: 8, marginTop: -8, marginBottom: 16 },
  errorText: { color: '#F44336', fontSize: 13 },

  infoBox:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.primary + '10', padding: 14, borderRadius: 12, marginTop: 8 },
  infoText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 18 },

  warningBox:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFF3CD', padding: 12, borderRadius: 12, marginBottom: 16 },
  warningText: { flex: 1, fontSize: 13, color: '#856404' },

  termsSection: { marginTop: 8, gap: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkText:{ flex: 1, fontSize: 14, color: '#444', lineHeight: 20 },
  link:     { color: colors.primary, fontWeight: '600' },

  footer:  { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  nextBtn: { backgroundColor: colors.dark1, borderRadius: 14, height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Seleção de perfil
  profileSection:   { flex: 1, padding: 24 },
  profileTitle:     { fontSize: 24, fontWeight: '700', color: colors.dark1, marginBottom: 6 },
  profileSub:       { fontSize: 15, color: '#666', marginBottom: 32 },
  profileCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: '#EEE' },
  profileCardActive:{ borderColor: colors.primary, backgroundColor: colors.primary + '05' },
  profileIcon:      { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  profileIconActive:{ backgroundColor: colors.primary },
  profileCardTitle: { fontSize: 16, fontWeight: '700', color: colors.dark1 },
  profileCardSub:   { fontSize: 13, color: '#888', marginTop: 3 },

  // Tipo pessoa
  tipoPessoaRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  tipoCard:      { flex: 1, alignItems: 'center', padding: 16, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EEE', gap: 6 },
  tipoCardActive:{ borderColor: colors.primary, backgroundColor: colors.primary + '06' },
  tipoLabel:     { fontSize: 14, fontWeight: '700', color: '#444' },
  tipoSub:       { fontSize: 11, color: '#AAA' },

  // Raio
  raioRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  raioChip:      { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DDD' },
  raioChipActive:{ backgroundColor: colors.primary, borderColor: colors.primary },
  raioText:      { fontSize: 13, fontWeight: '600', color: '#555' },

  // Modalidade
  modalRow:       { flexDirection: 'row', gap: 10, marginBottom: 8 },
  modalChip:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DDD' },
  modalChipActive:{ backgroundColor: colors.primary, borderColor: colors.primary },
  modalText:      { fontSize: 13, fontWeight: '600', color: '#555' },

  // Especialidades
  espCard:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#EEE', backgroundColor: '#FFF', marginBottom: 10 },
  espCardActive:{ borderColor: colors.primary, backgroundColor: colors.primary + '06' },
  espLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  espLabel:     { fontSize: 14, fontWeight: '500', color: '#555' },

  // Conta bancária
  contaRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  contaChip:      { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DDD' },
  contaChipActive:{ backgroundColor: colors.dark1, borderColor: colors.dark1 },
  contaText:      { fontSize: 13, fontWeight: '700', color: '#555' },

  // Sucesso cliente
  successScreen: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  successIcon:   { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle:  { fontSize: 26, fontWeight: '700', color: colors.dark1, marginBottom: 12 },
  successSub:    { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 40 },

  // Aguardando (técnico)
  waitingScreen:   { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 32 },
  waitingIcon:     { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  waitingTitle:    { fontSize: 24, fontWeight: '700', color: colors.dark1, marginBottom: 8 },
  waitingSub:      { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  waitingSteps:    { width: '100%', backgroundColor: '#FFF', borderRadius: 16, padding: 18, gap: 14, marginBottom: 16 },
  waitingStep:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waitingStepIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  waitingStepText: { fontSize: 14, color: '#888' },
  waitingNote:     { fontSize: 12, color: '#AAA', marginTop: 12, textAlign: 'center' },
});