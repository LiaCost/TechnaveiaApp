import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme';

// ─── Tipos ────────────────────────────────────────────────

interface SummaryData {
  executedItems: string;
  recommendations: string;
  usedParts: string;
  warrantyDays: string;
  finalValue: string;
  afterPhotos: string[];
}

// ─── Utilitários ──────────────────────────────────────────

function formatBRL(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (!digits) return '';
  const num = (parseInt(digits, 10) / 100).toFixed(2);
  return num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ─── Subcomponentes ───────────────────────────────────────

function SectionCard({ title, icon, children }: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={sc.card}>
      <View style={sc.header}>
        <View style={sc.iconWrap}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={sc.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 18, marginBottom: 14,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  iconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.primary + '12', justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.dark1 },
});

function FieldLabel({ text, optional }: { text: string; optional?: boolean }) {
  return (
    <Text style={fl.label}>
      {text}{optional && <Text style={fl.optional}> (opcional)</Text>}
    </Text>
  );
}

const fl = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  optional: { fontWeight: '400', color: '#AAA' },
});

// ─── Tela principal ────────────────────────────────────────

export function ServiceSummaryScreen({ navigation }: any) {
  const [data, setData] = useState<SummaryData>({
    executedItems: '',
    recommendations: '',
    usedParts: '',
    warrantyDays: '90',
    finalValue: '',
    afterPhotos: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof SummaryData>(key: K, val: SummaryData[K]) {
    setData(prev => ({ ...prev, [key]: val }));
  }

  // ── Fotos do após ──
  async function pickAfterPhoto() {
    if (data.afterPhotos.length >= 6) {
      Alert.alert('Limite atingido', 'Você pode adicionar até 6 fotos do resultado.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      set('afterPhotos', [...data.afterPhotos, result.assets[0].uri]);
    }
  }

  // ── Validação e envio ──
  function validate(): boolean {
    if (data.executedItems.trim().length < 10) {
      Alert.alert('Descrição obrigatória', 'Informe o que foi executado (mínimo 10 caracteres).');
      return false;
    }
    if (!data.finalValue) {
      Alert.alert('Valor obrigatório', 'Informe o valor final do serviço.');
      return false;
    }
    return true;
  }

  async function handleConfirm() {
    if (!validate()) return;

    Alert.alert(
      'Concluir serviço?',
      'O cliente será notificado para confirmar e avaliar o atendimento.',
      [
        { text: 'Revisar', style: 'cancel' },
        {
          text: 'Confirmar conclusão',
          onPress: async () => {
            setIsSubmitting(true);
            await new Promise(r => setTimeout(r, 1500));
            setIsSubmitting(false);
            setSubmitted(true);
          },
        },
      ]
    );
  }

  // ── Tela de sucesso ──
  if (submitted) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successScreen}>
          <View style={s.successRing}>
            <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
          </View>

          <Text style={s.successTitle}>Serviço concluído!</Text>
          <Text style={s.successSub}>
            O cliente foi notificado e tem até 48h para confirmar ou abrir uma disputa.
          </Text>

          <View style={s.nextSteps}>
            <Text style={s.nextStepsTitle}>Próximos passos</Text>

            <View style={s.nextStepItem}>
              <View style={[s.stepNum, { backgroundColor: '#E3F2FD' }]}>
                <Text style={[s.stepNumText, { color: '#1976D2' }]}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepLabel}>Aguardar confirmação do cliente</Text>
                <Text style={s.stepSub}>Prazo de até 48 horas</Text>
              </View>
            </View>

            <View style={s.nextStepItem}>
              <View style={[s.stepNum, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[s.stepNumText, { color: '#2E7D32' }]}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepLabel}>Pagamento liberado</Text>
                <Text style={s.stepSub}>Após confirmação, o valor vai para seu saldo</Text>
              </View>
            </View>

            <View style={s.nextStepItem}>
              <View style={[s.stepNum, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[s.stepNumText, { color: '#E65100' }]}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepLabel}>Receber avaliação</Text>
                <Text style={s.stepSub}>O cliente deixará uma avaliação do atendimento</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={s.doneBtn}
            onPress={() => navigation.navigate('Painel')}
          >
            <Text style={s.doneBtnText}>Voltar ao Painel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.financeBtn}
            onPress={() => navigation.navigate('Ganhos')}
          >
            <Ionicons name="wallet-outline" size={18} color={colors.primary} />
            <Text style={s.financeBtnText}>Ver saldo pendente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Formulário ──
  return (
    <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.dark1} />
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>Relatório de conclusão</Text>
            <Text style={s.headerSub}>Formatação de PC · João Pedro</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Resumo do serviço */}
          <View style={s.serviceTag}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={s.serviceTagText}>Serviço finalizado · Aguardando relatório</Text>
          </View>

          {/* O que foi executado */}
          <SectionCard title="O que foi executado" icon="construct-outline">
            <FieldLabel text="Descreva detalhadamente" />
            <TextInput
              style={s.textArea}
              placeholder="Ex: Realizei formatação completa, instalei Windows 11, todos os drivers, antivírus e realizei backup dos documentos do cliente..."
              placeholderTextColor="#BBB"
              multiline
              numberOfLines={5}
              value={data.executedItems}
              onChangeText={v => set('executedItems', v)}
              textAlignVertical="top"
            />
          </SectionCard>

          {/* Peças utilizadas */}
          <SectionCard title="Peças e materiais utilizados" icon="cube-outline">
            <FieldLabel text="Liste os itens utilizados" optional />
            <TextInput
              style={[s.textArea, { minHeight: 70 }]}
              placeholder="Ex: Pasta térmica Arctic MX-4, 5g&#10;Pano de microfibra"
              placeholderTextColor="#BBB"
              multiline
              value={data.usedParts}
              onChangeText={v => set('usedParts', v)}
              textAlignVertical="top"
            />
          </SectionCard>

          {/* Fotos do resultado */}
          <SectionCard title="Fotos do resultado" icon="images-outline">
            <Text style={s.photoHint}>
              Fotos do "depois" aumentam sua credibilidade e ficam visíveis no seu portfólio
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {data.afterPhotos.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.photoThumb}
                  onPress={() => set('afterPhotos', data.afterPhotos.filter((__, idx) => idx !== i))}
                >
                  <View style={s.photoPreview}>
                    <Ionicons name="image" size={24} color={colors.primary} />
                  </View>
                  <View style={s.removePhoto}>
                    <Ionicons name="close-circle" size={18} color="#F44336" />
                  </View>
                </TouchableOpacity>
              ))}
              {data.afterPhotos.length < 6 && (
                <TouchableOpacity style={s.addPhotoBtn} onPress={pickAfterPhoto}>
                  <Ionicons name="camera-outline" size={26} color={colors.primary} />
                  <Text style={s.addPhotoText}>Adicionar</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </SectionCard>

          {/* Recomendações */}
          <SectionCard title="Recomendações ao cliente" icon="bulb-outline">
            <FieldLabel text="Orientações pós-atendimento" optional />
            <TextInput
              style={[s.textArea, { minHeight: 80 }]}
              placeholder="Ex: Recomendo manter o antivírus sempre atualizado e realizar limpeza física a cada 6 meses..."
              placeholderTextColor="#BBB"
              multiline
              value={data.recommendations}
              onChangeText={v => set('recommendations', v)}
              textAlignVertical="top"
            />
          </SectionCard>

          {/* Garantia e valor */}
          <SectionCard title="Garantia e valor final" icon="shield-checkmark-outline">
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ flex: 1 }}>
                <FieldLabel text="Garantia (dias)" />
                <View style={s.warrantyRow}>
                  {['0', '30', '60', '90', '180'].map(d => (
                    <TouchableOpacity
                      key={d}
                      style={[s.warrantyChip, data.warrantyDays === d && s.warrantyChipActive]}
                      onPress={() => set('warrantyDays', d)}
                    >
                      <Text style={[s.warrantyText, data.warrantyDays === d && s.warrantyTextActive]}>
                        {d === '0' ? 'Sem' : `${d}d`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <FieldLabel text="Valor final cobrado" />
              <View style={s.valueRow}>
                <Text style={s.currencySymbol}>R$</Text>
                <TextInput
                  style={s.valueInput}
                  placeholder="0,00"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  value={data.finalValue}
                  onChangeText={v => set('finalValue', formatBRL(v))}
                />
              </View>
              <Text style={s.valueNote}>
                Valor combinado: <Text style={{ fontWeight: '700', color: colors.dark1 }}>R$ 150,00</Text>
                {' '}· Você pode ajustar se houve acréscimos
              </Text>
            </View>
          </SectionCard>

        </ScrollView>

        {/* Botão de confirmar */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.confirmBtn, isSubmitting && { opacity: 0.6 }]}
            onPress={handleConfirm}
            disabled={isSubmitting}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
            <Text style={s.confirmBtnText}>
              {isSubmitting ? 'Enviando...' : 'Confirmar Conclusão'}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.dark1, textAlign: 'center' },
  headerSub: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 2 },

  scroll: { padding: 16, paddingBottom: 40 },

  serviceTag: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  serviceTagText: { fontSize: 13, fontWeight: '600', color: '#2E7D32' },

  textArea: {
    backgroundColor: '#F8F9FF', borderWidth: 1, borderColor: '#E0E4F0',
    borderRadius: 12, padding: 14, fontSize: 14, color: '#222',
    minHeight: 120,
  },

  photoHint: { fontSize: 13, color: '#888', lineHeight: 18 },
  photoThumb: { width: 80, height: 80, marginRight: 10, position: 'relative' },
  photoPreview: {
    width: 80, height: 80, borderRadius: 12,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  removePhoto: { position: 'absolute', top: -6, right: -6 },
  addPhotoBtn: {
    width: 80, height: 80, borderRadius: 12,
    borderStyle: 'dashed', borderWidth: 2, borderColor: colors.primary + '50',
    backgroundColor: colors.primary + '05',
    justifyContent: 'center', alignItems: 'center',
  },
  addPhotoText: { fontSize: 10, color: colors.primary, fontWeight: '600', marginTop: 4 },

  warrantyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  warrantyChip: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#DDD', backgroundColor: '#FFF',
  },
  warrantyChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  warrantyText: { fontSize: 12, fontWeight: '600', color: '#666' },
  warrantyTextActive: { color: '#FFF' },

  valueRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F9FF', borderWidth: 1.5, borderColor: colors.primary + '50',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
  },
  currencySymbol: { fontSize: 20, fontWeight: '700', color: '#AAA', marginRight: 6 },
  valueInput: { flex: 1, fontSize: 28, fontWeight: '700', color: colors.dark1, paddingVertical: 10 },
  valueNote: { fontSize: 12, color: '#888', marginTop: 8, lineHeight: 18 },

  footer: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#EEE',
  },
  confirmBtn: {
    backgroundColor: '#2E7D32', borderRadius: 14, height: 54,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Sucesso
  successScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  successRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: '700', color: colors.dark1, marginBottom: 8 },
  successSub: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 28 },

  nextSteps: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 20,
    width: '100%', marginBottom: 28,
    borderWidth: 1, borderColor: '#E8EEFF',
  },
  nextStepsTitle: { fontSize: 14, fontWeight: '700', color: '#AAA', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  nextStepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  stepNum: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { fontSize: 14, fontWeight: '700' },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  stepSub: { fontSize: 12, color: '#888', marginTop: 2 },

  doneBtn: {
    backgroundColor: colors.dark1, borderRadius: 14, height: 54,
    width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  doneBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  financeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12,
  },
  financeBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});