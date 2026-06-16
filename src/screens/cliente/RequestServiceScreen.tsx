import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, Animated,
  KeyboardAvoidingView, Platform, FlatList, ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme';
import { technicianService, orderService, Technician, ApiError } from '../../services/api';

// ─── Tipos ────────────────────────────────────────────────

interface Category {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  subcategories: string[];
}

interface ServiceRequest {
  categoryId: string;
  categoryLabel: string;
  subcategory: string;
  description: string;
  photos: string[];
  modalidade: 'presencial' | 'remoto';
  endereco: string;
  remotoSoftware: string;
  isUrgent: boolean;
  date: string;        // 'YYYY-MM-DD'
  time: string;        // 'HH:MM'
  technicianId: string | null;
  anyTechnician: boolean;
  notes: string;
  aceitaTermos: boolean;
}

// ─── Dados mock ───────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'pc', label: 'Computadores / Notebooks', icon: 'desktop-outline',
    subcategories: ['Formatação', 'Lentidão / Vírus', 'Hardware (HD, RAM, Fonte)', 'Tela quebrada', 'Não liga', 'Outro'],
  },
  {
    id: 'celular', label: 'Celulares / Tablets', icon: 'phone-portrait-outline',
    subcategories: ['Tela quebrada', 'Bateria', 'Câmera', 'Placa-mãe', 'Software', 'Outro'],
  },
  {
    id: 'redes', label: 'Redes e Internet', icon: 'wifi-outline',
    subcategories: ['Instalação de roteador', 'Cabeamento', 'Lentidão na internet', 'Rede corporativa', 'Outro'],
  },
  {
    id: 'automacao', label: 'Automação Residencial', icon: 'home-outline',
    subcategories: ['Smart Home', 'Instalação de dispositivos', 'Integração de sistemas', 'Outro'],
  },
  {
    id: 'cftv', label: 'Segurança Eletrônica', icon: 'videocam-outline',
    subcategories: ['Instalação de câmeras', 'Manutenção de CFTV', 'Alarme', 'Controle de acesso', 'Outro'],
  },
  {
    id: 'remoto', label: 'Suporte Remoto', icon: 'laptop-outline',
    subcategories: ['Lentidão / Vírus', 'Configurações', 'Instalação de software', 'Erro no sistema', 'Outro'],
  },
  {
    id: 'impressora', label: 'Impressoras / Periféricos', icon: 'print-outline',
    subcategories: ['Não imprime', 'Atolamento de papel', 'Instalação de driver', 'Manutenção', 'Outro'],
  },
  {
    id: 'tv', label: 'Smart TV / Home Theater', icon: 'tv-outline',
    subcategories: ['Sem imagem', 'Sem som', 'Configuração de streaming', 'Instalação', 'Outro'],
  },
];

const TIMES = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

// ─── Utilitários ──────────────────────────────────────────

function getDatesFromToday(count: number): { label: string; value: string; dayName: string }[] {
  const results = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã'
      : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    results.push({ value, label, dayName });
  }
  return results;
}

const DATES = getDatesFromToday(7);

// ─── Subcomponentes ───────────────────────────────────────

function StepHeader({ step, total, title, sub, onBack }: {
  step: number; total: number; title: string; sub: string; onBack: () => void;
}) {
  return (
    <>
      <View style={sh.header}>
        <TouchableOpacity onPress={onBack} style={sh.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.dark1} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={sh.stepLabel}>Passo {step} de {total}</Text>
          <Text style={sh.title}>{title}</Text>
        </View>
      </View>
      <View style={sh.progressBar}>
        <View style={[sh.progressFill, { width: `${(step / total) * 100}%` }]} />
      </View>
      <Text style={sh.sub}>{sub}</Text>
    </>
  );
}

const sh = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  stepLabel: { fontSize: 11, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 20, fontWeight: '700', color: colors.dark1, marginTop: 2 },
  progressBar: { height: 3, backgroundColor: '#E8EEFF', marginHorizontal: 20 },
  progressFill: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },
  sub: { fontSize: 14, color: '#666', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4, lineHeight: 20 },
});

function NextButton({ label = 'Próximo', onPress, disabled = false }: {
  label?: string; onPress: () => void; disabled?: boolean;
}) {
  return (
    <View style={nb.wrap}>
      <TouchableOpacity
        style={[nb.btn, disabled && nb.disabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={nb.text}>{label}</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const nb = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: Platform.OS === 'android' ? 34 : 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  btn: {
    backgroundColor: colors.dark1, borderRadius: 14, height: 54,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  disabled: { opacity: 0.35 },
  text: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

// ─── Tela principal ────────────────────────────────────────

export function RequestServiceScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 6;

  const [req, setReq] = useState<ServiceRequest>({
    categoryId: '', categoryLabel: '', subcategory: '',
    description: '', photos: [],
    modalidade: 'presencial', endereco: 'Av. Paulista, 1000 – São Paulo, SP',
    remotoSoftware: '',
    isUrgent: false, date: DATES[0].value, time: '',
    technicianId: null, anyTechnician: false,
    notes: '', aceitaTermos: false,
  });

  // Técnicos carregados da API
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof ServiceRequest>(key: K, val: ServiceRequest[K]) {
    setReq(prev => ({ ...prev, [key]: val }));
  }

  function goBack() {
    if (step === 1) navigation.goBack();
    else setStep(s => s - 1);
  }

  function goNext() { setStep(s => s + 1); }

  // Carrega técnicos quando chega no passo 4
  useEffect(() => {
    if (step !== 4) return;
    setLoadingTechs(true);
    technicianService
      .search({ categoria: req.categoryId, modalidade: req.modalidade })
      .then(data => setTechnicians(data))
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os técnicos.'))
      .finally(() => setLoadingTechs(false));
  }, [step]);

  // ── Passo 1: Categoria e descrição ──────────────────────
  async function pickPhoto() {
    if (req.photos.length >= 5) {
      Alert.alert('Limite atingido', 'Você pode enviar no máximo 5 fotos.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso às fotos para continuar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      set('photos', [...req.photos, result.assets[0].uri]);
    }
  }

  function validateStep1() {
    if (!req.categoryId) { Alert.alert('Selecione uma categoria'); return false; }
    if (!req.subcategory) { Alert.alert('Selecione o tipo de problema'); return false; }
    if (req.description.trim().length < 20) {
      Alert.alert('Descrição muito curta', 'Descreva o problema com pelo menos 20 caracteres.');
      return false;
    }
    return true;
  }

  // ── Passo 3: Data e horário ──────────────────────────────
  function validateStep3() {
    if (!req.isUrgent && !req.time) {
      Alert.alert('Selecione um horário ou marque como Urgente');
      return false;
    }
    return true;
  }

  // ── Passo 4: Técnico ─────────────────────────────────────
  async function validateStep4(): Promise<boolean> {
    if (!req.technicianId && !req.anyTechnician) {
      Alert.alert('Escolha um técnico ou selecione "Qualquer disponível"');
      return false;
    }

    // Se escolheu um técnico específico E não é urgente, verifica disponibilidade
    if (req.technicianId && !req.isUrgent && req.date && req.time) {
      try {
        const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
        const res = await fetch(`${BASE_URL}/technicians/${req.technicianId}/availability?date=${req.date}`);
        if (res.ok) {
          const json = await res.json();
          const ocupados: string[] = json.data?.horariosOcupados ?? [];
          if (ocupados.includes(req.time)) {
            Alert.alert(
              'Horário indisponível',
              `O técnico já tem um agendamento às ${req.time}. Por favor, volte e escolha outro horário.`,
              [
                { text: 'Escolher outro horário', onPress: () => setStep(3) },
                { text: 'Escolher outro técnico' },
              ]
            );
            return false;
          }
        }
      } catch {
        // Se falhou a consulta, permite seguir (não bloqueia o fluxo)
      }
    }

    return true;
  }

  // ── Passo 5: Confirmação ─────────────────────────────────
  async function handleConfirm() {
    if (!req.aceitaTermos) {
      Alert.alert('Aceite os termos para continuar');
      return;
    }
    setSubmitting(true);
    try {
      await orderService.create({
        categoria: req.categoryLabel,
        subcategoria: req.subcategory,
        descricao: req.description,
        modalidade: req.modalidade,
        endereco: req.modalidade === 'presencial' ? req.endereco : undefined,
        dataAgendada: req.isUrgent ? undefined : req.date,
        horaAgendada: req.isUrgent ? undefined : req.time,
        tecnicoId: req.anyTechnician ? undefined : (req.technicianId ?? undefined),
        status: 'solicitado',
      });
      goNext();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não foi possível enviar sua solicitação.';
      Alert.alert('Erro', msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Passo 6: Aguardando ──────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (step !== 6) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [step]);

  const selectedTech = technicians.find(t => t.id === req.technicianId);
  const selectedDate = DATES.find(d => d.value === req.date);

  // ─── Render ──────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ══════════ PASSO 1 ══════════ */}
        {step === 1 && (
          <>
            <StepHeader step={1} total={TOTAL_STEPS} onBack={goBack}
              title="Qual é o problema?"
              sub="Selecione a categoria e descreva o que está acontecendo"
            />
            <ScrollView contentContainerStyle={s.scroll}>

              {/* Categorias */}
              <Text style={s.sectionLabel}>Categoria</Text>
              <View style={s.categoryGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[s.catCard, req.categoryId === cat.id && s.catCardActive]}
                    onPress={() => { set('categoryId', cat.id); set('categoryLabel', cat.label); set('subcategory', ''); }}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={26}
                      color={req.categoryId === cat.id ? colors.primary : '#888'}
                    />
                    <Text style={[s.catLabel, req.categoryId === cat.id && s.catLabelActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Subcategoria */}
              {req.categoryId !== '' && (
                <>
                  <Text style={s.sectionLabel}>Tipo de problema</Text>
                  <View style={s.subGrid}>
                    {CATEGORIES.find(c => c.id === req.categoryId)?.subcategories.map(sub => (
                      <TouchableOpacity
                        key={sub}
                        style={[s.subChip, req.subcategory === sub && s.subChipActive]}
                        onPress={() => set('subcategory', sub)}
                      >
                        <Text style={[s.subChipText, req.subcategory === sub && s.subChipTextActive]}>
                          {sub}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Descrição */}
              <Text style={s.sectionLabel}>Descreva o problema <Text style={s.required}>*</Text></Text>
              <TextInput
                style={s.textArea}
                placeholder="Ex: Meu notebook não liga desde ontem. Quando pressiono o botão, a luz pisca uma vez e apaga..."
                placeholderTextColor="#AAA"
                multiline
                numberOfLines={5}
                value={req.description}
                onChangeText={v => set('description', v)}
                textAlignVertical="top"
              />
              <Text style={[s.charCount, req.description.length < 20 && { color: '#F44336' }]}>
                {req.description.length}/20 caracteres mínimos
              </Text>

              {/* Fotos */}
              <Text style={s.sectionLabel}>Fotos do problema <Text style={s.optional}>(opcional, até 5)</Text></Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {req.photos.map((uri, i) => (
                  <View key={i} style={s.photoThumb}>
                    <TouchableOpacity
                      style={s.removePhoto}
                      onPress={() => set('photos', req.photos.filter((_, idx) => idx !== i))}
                    >
                      <Ionicons name="close-circle" size={20} color="#F44336" />
                    </TouchableOpacity>
                    <View style={s.photoPlaceholder}>
                      <Ionicons name="image" size={28} color={colors.primary} />
                    </View>
                  </View>
                ))}
                {req.photos.length < 5 && (
                  <TouchableOpacity style={s.addPhotoBtn} onPress={pickPhoto}>
                    <Ionicons name="camera-outline" size={28} color={colors.primary} />
                    <Text style={s.addPhotoText}>Adicionar</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

            </ScrollView>
            <NextButton onPress={() => { if (validateStep1()) goNext(); }} />
          </>
        )}

        {/* ══════════ PASSO 2 ══════════ */}
        {step === 2 && (
          <>
            <StepHeader step={2} total={TOTAL_STEPS} onBack={goBack}
              title="Local e modalidade"
              sub="Como o técnico vai te atender?"
            />
            <ScrollView contentContainerStyle={s.scroll}>

              <Text style={s.sectionLabel}>Modalidade de atendimento</Text>
              <View style={s.modalRow}>
                {(['presencial', 'remoto'] as const).map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[s.modalCard, req.modalidade === m && s.modalCardActive]}
                    onPress={() => set('modalidade', m)}
                  >
                    <Ionicons
                      name={m === 'presencial' ? 'person-outline' : 'laptop-outline'}
                      size={28}
                      color={req.modalidade === m ? colors.primary : '#888'}
                    />
                    <Text style={[s.modalLabel, req.modalidade === m && { color: colors.primary }]}>
                      {m === 'presencial' ? 'Presencial' : 'Remoto'}
                    </Text>
                    <Text style={s.modalSub}>
                      {m === 'presencial' ? 'Técnico vai até você' : 'Via software de acesso'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {req.modalidade === 'presencial' && (
                <>
                  <Text style={s.sectionLabel}>Endereço de atendimento</Text>
                  <TouchableOpacity style={s.addressCard}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.addressText}>{req.endereco}</Text>
                      <Text style={s.addressSub}>Endereço principal cadastrado</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CCC" />
                  </TouchableOpacity>

                  <TouchableOpacity style={s.addAddressBtn}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                    <Text style={s.addAddressText}>Usar outro endereço</Text>
                  </TouchableOpacity>
                </>
              )}

              {req.modalidade === 'remoto' && (
                <>
                  <Text style={s.sectionLabel}>Software de acesso remoto</Text>
                  <View style={s.remotoGrid}>
                    {['AnyDesk', 'TeamViewer', 'Outro'].map(sw => (
                      <TouchableOpacity
                        key={sw}
                        style={[s.subChip, req.remotoSoftware === sw && s.subChipActive]}
                        onPress={() => set('remotoSoftware', sw)}
                      >
                        <Text style={[s.subChipText, req.remotoSoftware === sw && s.subChipTextActive]}>
                          {sw}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={s.infoBox}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#4CAF50" />
                    <Text style={s.infoText}>
                      Você terá controle total durante a sessão remota e pode encerrar a qualquer momento.
                    </Text>
                  </View>
                </>
              )}

            </ScrollView>
            <NextButton onPress={goNext} />
          </>
        )}

        {/* ══════════ PASSO 3 ══════════ */}
        {step === 3 && (
          <>
            <StepHeader step={3} total={TOTAL_STEPS} onBack={goBack}
              title="Data e horário"
              sub="Quando você quer ser atendido?"
            />
            <ScrollView contentContainerStyle={s.scroll}>

              {/* Urgente */}
              <TouchableOpacity
                style={[s.urgentCard, req.isUrgent && s.urgentCardActive]}
                onPress={() => set('isUrgent', !req.isUrgent)}
              >
                <View style={[s.urgentIcon, req.isUrgent && s.urgentIconActive]}>
                  <Ionicons name="flash" size={22} color={req.isUrgent ? '#FFF' : '#FF9800'} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.urgentTitle, req.isUrgent && { color: '#FF9800' }]}>
                    Urgente – Primeiro disponível
                  </Text>
                  <Text style={s.urgentSub}>O técnico mais próximo aceita o mais rápido possível</Text>
                </View>
                <Ionicons
                  name={req.isUrgent ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={req.isUrgent ? '#FF9800' : '#CCC'}
                />
              </TouchableOpacity>

              {!req.isUrgent && (
                <>
                  {/* Calendário */}
                  <Text style={s.sectionLabel}>Escolha o dia</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    {DATES.map(d => (
                      <TouchableOpacity
                        key={d.value}
                        style={[s.dateCard, req.date === d.value && s.dateCardActive]}
                        onPress={() => set('date', d.value)}
                      >
                        <Text style={[s.dateDayName, req.date === d.value && { color: colors.primary }]}>
                          {d.dayName}
                        </Text>
                        <Text style={[s.dateLabel, req.date === d.value && { color: colors.primary, fontWeight: '700' }]}>
                          {d.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Horários */}
                  <Text style={s.sectionLabel}>Escolha o horário</Text>
                  <View style={s.timeGrid}>
                    {TIMES.map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[s.timeChip, req.time === t && s.timeChipActive]}
                        onPress={() => set('time', t)}
                      >
                        <Text style={[s.timeText, req.time === t && s.timeTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

            </ScrollView>
            <NextButton onPress={() => { if (validateStep3()) goNext(); }} />
          </>
        )}

        {/* ══════════ PASSO 4 ══════════ */}
        {step === 4 && (
          <>
            <StepHeader step={4} total={TOTAL_STEPS} onBack={goBack}
              title="Escolha o técnico"
              sub="Disponíveis para o seu serviço e horário"
            />
            <ScrollView contentContainerStyle={s.scroll}>

              {/* Qualquer técnico */}
              <TouchableOpacity
                style={[s.anyTechCard, req.anyTechnician && s.anyTechCardActive]}
                onPress={() => {
                  set('anyTechnician', !req.anyTechnician);
                  if (!req.anyTechnician) set('technicianId', null);
                }}
              >
                <Ionicons
                  name={req.anyTechnician ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={req.anyTechnician ? colors.primary : '#CCC'}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[s.anyTechTitle, req.anyTechnician && { color: colors.primary }]}>
                    Aceitar qualquer técnico disponível
                  </Text>
                  <Text style={s.anyTechSub}>Resposta mais rápida, todos são verificados</Text>
                </View>
              </TouchableOpacity>

              <Text style={s.sectionLabel}>Ou escolha um específico</Text>

              {loadingTechs ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
              ) : technicians.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Ionicons name="search-outline" size={40} color="#CCC" />
                  <Text style={{ color: '#999', marginTop: 10, textAlign: 'center' }}>
                    Nenhum técnico disponível para essa categoria no momento.
                  </Text>
                </View>
              ) : (
                technicians.map(tech => (
                  <TouchableOpacity
                    key={tech.id}
                    style={[
                      s.techCard,
                      req.technicianId === tech.id && !req.anyTechnician && s.techCardActive,
                      req.anyTechnician && s.techCardDimmed,
                    ]}
                    onPress={() => {
                      if (req.anyTechnician) return;
                      set('technicianId', req.technicianId === tech.id ? null : tech.id);
                    }}
                  >
                    <View style={s.techAvatar}>
                      <Text style={s.techInitials}>{tech.nome.split(' ').map(n => n[0]).join('')}</Text>
                      {tech.verificado && (
                        <View style={s.verifiedBadge}>
                          <Ionicons name="checkmark" size={10} color="#FFF" />
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={s.techName}>{tech.nome}</Text>
                        {tech.verificado && (
                          <Text style={s.verifiedText}>Verificado</Text>
                        )}
                      </View>
                      <Text style={s.techSpec}>{tech.especialidades.join(', ')}</Text>
                      <View style={s.techMeta}>
                        <Ionicons name="star" size={13} color="#FFC107" />
                        <Text style={s.techMetaText}>{tech.avaliacao} ({tech.totalAvaliacoes})</Text>
                        {tech.distancia && (
                          <>
                            <Ionicons name="location-outline" size={13} color="#999" />
                            <Text style={s.techMetaText}>{tech.distancia}</Text>
                          </>
                        )}
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.techPrice}>{tech.precoMedio ?? 'A combinar'}</Text>
                      <Text style={s.techPriceSub}>estimativa</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}

            </ScrollView>
            <NextButton onPress={async () => { if (await validateStep4()) goNext(); }} />
          </>
        )}

        {/* ══════════ PASSO 5 ══════════ */}
        {step === 5 && (
          <>
            <StepHeader step={5} total={TOTAL_STEPS} onBack={goBack}
              title="Revisão e confirmação"
              sub="Confira os detalhes antes de enviar"
            />
            <ScrollView contentContainerStyle={s.scroll}>

              {/* Resumo */}
              <View style={s.summaryCard}>
                <Text style={s.summaryTitle}>Resumo da solicitação</Text>

                <View style={s.summaryRow}>
                  <Ionicons name="construct-outline" size={18} color={colors.primary} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={s.summaryKey}>Serviço</Text>
                    <Text style={s.summaryVal}>{req.categoryLabel}</Text>
                    <Text style={s.summaryValSub}>{req.subcategory}</Text>
                  </View>
                </View>

                <View style={s.summaryRow}>
                  <Ionicons
                    name={req.modalidade === 'presencial' ? 'location-outline' : 'laptop-outline'}
                    size={18}
                    color={colors.primary}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={s.summaryKey}>Local</Text>
                    <Text style={s.summaryVal}>
                      {req.modalidade === 'presencial' ? req.endereco : `Remoto via ${req.remotoSoftware || 'software'}`}
                    </Text>
                  </View>
                </View>

                <View style={s.summaryRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={s.summaryKey}>Data e horário</Text>
                    <Text style={s.summaryVal}>
                      {req.isUrgent
                        ? 'Urgente – Primeiro disponível'
                        : `${selectedDate?.dayName}, ${selectedDate?.label} às ${req.time}`}
                    </Text>
                  </View>
                </View>

                <View style={s.summaryRow}>
                  <Ionicons name="person-outline" size={18} color={colors.primary} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={s.summaryKey}>Técnico</Text>
                    <Text style={s.summaryVal}>
                      {req.anyTechnician ? 'Qualquer técnico disponível' : selectedTech?.nome ?? '–'}
                    </Text>
                  </View>
                </View>

                <View style={[s.summaryRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
                  <Ionicons name="wallet-outline" size={18} color={colors.primary} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={s.summaryKey}>Estimativa de preço</Text>
                    <Text style={s.summaryVal}>
                      {req.anyTechnician
                        ? 'A combinar após diagnóstico'
                        : selectedTech?.precoMedio ?? 'A combinar'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Observações adicionais */}
              <Text style={s.sectionLabel}>Observações adicionais <Text style={s.optional}>(opcional)</Text></Text>
              <TextInput
                style={[s.textArea, { height: 80 }]}
                placeholder="Algum detalhe extra que o técnico deva saber..."
                placeholderTextColor="#AAA"
                multiline
                value={req.notes}
                onChangeText={v => set('notes', v)}
                textAlignVertical="top"
              />

              {/* Termos */}
              <TouchableOpacity
                style={s.checkRow}
                onPress={() => set('aceitaTermos', !req.aceitaTermos)}
              >
                <Ionicons
                  name={req.aceitaTermos ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={req.aceitaTermos ? colors.primary : '#CCC'}
                />
                <Text style={s.checkText}>
                  Concordo com os{' '}
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Termos do Serviço</Text>
                  {' '}e com a estimativa de preço apresentada
                </Text>
              </TouchableOpacity>

            </ScrollView>
            <NextButton label="Confirmar Solicitação" onPress={handleConfirm} disabled={submitting} />
          </>
        )}

        {/* ══════════ PASSO 6 ══════════ */}
        {step === 6 && (
          <View style={s.waitingScreen}>
            <Animated.View style={[s.pulseRing, { transform: [{ scale: pulseAnim }] }]}>
              <View style={s.pulseCore}>
                <Ionicons name="time" size={40} color="#FFF" />
              </View>
            </Animated.View>

            <Text style={s.waitingTitle}>Solicitação enviada!</Text>
            <Text style={s.waitingStatus}>Aguardando aceitação do técnico</Text>

            <View style={s.waitingInfoCard}>
              <View style={s.waitingInfoRow}>
                <Ionicons name="hourglass-outline" size={18} color={colors.primary} />
                <Text style={s.waitingInfoText}>Prazo máximo de resposta: <Text style={{ fontWeight: '700' }}>30 minutos</Text></Text>
              </View>
              <View style={s.waitingInfoRow}>
                <Ionicons name="notifications-outline" size={18} color={colors.primary} />
                <Text style={s.waitingInfoText}>Você receberá uma notificação quando o técnico aceitar</Text>
              </View>
              <View style={s.waitingInfoRow}>
                <Ionicons
                  name={req.modalidade === 'presencial' ? 'location-outline' : 'laptop-outline'}
                  size={18}
                  color={colors.primary}
                />
                <Text style={s.waitingInfoText}>
                  {req.modalidade === 'presencial'
                    ? `Atendimento presencial em: ${req.endereco}`
                    : `Atendimento remoto via ${req.remotoSoftware || 'software'}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() =>
                Alert.alert(
                  'Cancelar solicitação?',
                  'Deseja cancelar esta solicitação?',
                  [
                    { text: 'Não', style: 'cancel' },
                    { text: 'Sim, cancelar', style: 'destructive', onPress: () => navigation.popToTop() },
                  ]
                )
              }
            >
              <Text style={s.cancelText}>Cancelar solicitação</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.homeBtn} onPress={() => navigation.popToTop()}>
              <Text style={s.homeBtnText}>Voltar para o início</Text>
              <Ionicons name="home-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scroll: { padding: 20, paddingBottom: 40 },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: '#F44336' },
  optional: { color: '#AAA', fontWeight: '400', textTransform: 'none', letterSpacing: 0 },

  // Categorias
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catCard: {
    width: '47%', backgroundColor: '#FFF', borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 2, borderColor: '#EEE',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
  },
  catCardActive: { borderColor: colors.primary, backgroundColor: '#F5F5F5' },
  catLabel: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8, fontWeight: '500' },
  catLabelActive: { color: colors.primary, fontWeight: '700' },

  // Subcategorias
  subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  subChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#FFF' },
  subChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  subChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  subChipTextActive: { color: '#FFF', fontWeight: '600' },

  // Descrição
  textArea: {
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E4F0',
    borderRadius: 12, padding: 16, fontSize: 15, color: '#111',
    minHeight: 120, marginBottom: 6,
  },
  charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginBottom: 20 },

  // Fotos
  photoThumb: { width: 90, height: 90, marginRight: 10, position: 'relative' },
  photoPlaceholder: {
    width: 90, height: 90, borderRadius: 12, backgroundColor: colors.primary + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  removePhoto: { position: 'absolute', top: -6, right: -6, zIndex: 1 },
  addPhotoBtn: {
    width: 90, height: 90, borderRadius: 12, borderStyle: 'dashed',
    borderWidth: 2, borderColor: colors.primary + '60',
    backgroundColor: colors.primary + '05',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  addPhotoText: { fontSize: 11, color: colors.primary, marginTop: 4, fontWeight: '600' },

  // Modalidade
  modalRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modalCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 18,
    alignItems: 'center', borderWidth: 2, borderColor: '#EEE', gap: 6,
  },
  modalCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '06' },
  modalLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  modalSub: { fontSize: 12, color: '#999', textAlign: 'center' },

  // Endereço
  addressCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E0E4F0', marginBottom: 10,
  },
  addressText: { fontSize: 14, fontWeight: '600', color: '#333' },
  addressSub: { fontSize: 12, color: '#999', marginTop: 2 },
  addAddressBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4 },
  addAddressText: { color: colors.primary, fontWeight: '600', fontSize: 14 },

  // Remoto
  remotoGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  infoBox: {
    flexDirection: 'row', gap: 10, backgroundColor: '#F0FFF5',
    borderRadius: 12, padding: 14, marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 13, color: '#2E7D32', lineHeight: 18 },

  // Urgente
  urgentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 2, borderColor: '#EEE',
  },
  urgentCardActive: { borderColor: '#FF9800', backgroundColor: '#FFF8F0' },
  urgentIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF3E0',
    justifyContent: 'center', alignItems: 'center',
  },
  urgentIconActive: { backgroundColor: '#FF9800' },
  urgentTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  urgentSub: { fontSize: 12, color: '#999', marginTop: 2 },

  // Datas
  dateCard: {
    alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: '#FFF', borderRadius: 14, marginRight: 10,
    borderWidth: 2, borderColor: '#EEE', minWidth: 70,
  },
  dateCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  dateDayName: { fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase' },
  dateLabel: { fontSize: 14, color: '#333', marginTop: 4, fontWeight: '500' },

  // Horários
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E4F0',
  },
  timeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeText: { fontSize: 14, color: '#555', fontWeight: '500' },
  timeTextActive: { color: '#FFF', fontWeight: '700' },

  // Técnicos
  anyTechCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 2, borderColor: '#EEE',
  },
  anyTechCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '06' },
  anyTechTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  anyTechSub: { fontSize: 12, color: '#999', marginTop: 2 },

  techCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: '#EEE',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
  },
  techCardActive: { borderColor: colors.primary, backgroundColor: '#F5F5F5' },
  techCardDimmed: { opacity: 0.4 },
  techAvatar: {
    width: 50, height: 50, borderRadius: 14, backgroundColor: '#ECEEF5',
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  techInitials: { fontSize: 16, fontWeight: '700', color: colors.primary },
  verifiedBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFF',
  },
  techName: { fontSize: 15, fontWeight: '700', color: '#222' },
  verifiedText: { fontSize: 10, color: colors.primary, fontWeight: '700', backgroundColor: colors.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  techSpec: { fontSize: 12, color: '#666', marginTop: 2 },
  techMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  techMetaText: { fontSize: 12, color: '#666', marginRight: 6 },
  techPrice: { fontSize: 14, fontWeight: '700', color: colors.dark1 },
  techPriceSub: { fontSize: 10, color: '#AAA', marginTop: 2 },

  // Revisão
  summaryCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    marginBottom: 20, borderWidth: 1, borderColor: '#E8EEFF',
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 4,
  },
  summaryKey: { fontSize: 11, color: '#AAA', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryVal: { fontSize: 14, color: '#222', fontWeight: '600', marginTop: 2 },
  summaryValSub: { fontSize: 12, color: '#888', marginTop: 1 },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 16 },
  checkText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 20 },

  // Aguardando
  waitingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  pulseRing: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
  },
  pulseCore: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  waitingTitle: { fontSize: 24, fontWeight: '700', color: colors.dark1, marginBottom: 6 },
  waitingStatus: { fontSize: 15, color: '#666', marginBottom: 28 },
  waitingInfoCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    width: '100%', gap: 14, marginBottom: 24,
    borderWidth: 1, borderColor: '#E8EEFF',
  },
  waitingInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  waitingInfoText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 20 },
  cancelBtn: { paddingVertical: 12 },
  cancelText: { color: '#F44336', fontWeight: '600', fontSize: 14 },
  homeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 8, padding: 12,
  },
  homeBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});