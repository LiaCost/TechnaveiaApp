import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

// ─── Tipos ────────────────────────────────────────────────

type WithdrawStatus = 'processando' | 'concluido' | 'falhou';

interface BankAccount {
  banco: string;
  tipo: 'Corrente' | 'Poupança' | 'PIX';
  chave: string;
  agencia?: string;
  conta?: string;
}

interface WithdrawHistory {
  id: string;
  date: string;
  value: number;
  status: WithdrawStatus;
  account: string;
}

// ─── Dados mock ───────────────────────────────────────────

const SALDO_DISPONIVEL = 1450.20;
const SALDO_PENDENTE = 420.00;

const MOCK_ACCOUNT: BankAccount = {
  banco: 'Nubank',
  tipo: 'PIX',
  chave: 'ricardo.silva@email.com',
};

const MOCK_HISTORY: WithdrawHistory[] = [
  { id: '1', date: '15 Mai 2026', value: 800.00, status: 'concluido', account: 'PIX · ricardo.silva@email.com' },
  { id: '2', date: '01 Mai 2026', value: 1200.00, status: 'concluido', account: 'PIX · ricardo.silva@email.com' },
  { id: '3', date: '18 Abr 2026', value: 650.50, status: 'concluido', account: 'PIX · ricardo.silva@email.com' },
  { id: '4', date: '02 Abr 2026', value: 300.00, status: 'falhou', account: 'PIX · ricardo.silva@email.com' },
];

const STATUS_CFG: Record<WithdrawStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  processando: { label: 'Processando', color: '#E65100', bg: '#FFF3E0', icon: 'time-outline' },
  concluido:   { label: 'Concluído',   color: '#2E7D32', bg: '#E8F5E9', icon: 'checkmark-circle-outline' },
  falhou:      { label: 'Falhou',      color: '#C62828', bg: '#FFEBEE', icon: 'alert-circle-outline' },
};

// ─── Utilitários ──────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseBRL(raw: string): number {
  return parseFloat(raw.replace(/\D/g, '').padEnd(3, '0').replace(/(\d+)(\d{2})$/, '$1.$2')) || 0;
}

function formatInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (!digits) return '';
  const num = (parseInt(digits, 10) / 100).toFixed(2);
  return num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ─── Tela principal ────────────────────────────────────────

export function WithdrawScreen({ navigation }: any) {
  const [rawValue, setRawValue] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const numericValue = parseBRL(rawValue.replace(',', '.'));
  const isValid = numericValue >= 10 && numericValue <= SALDO_DISPONIVEL;

  const presets = [100, 300, 500, SALDO_DISPONIVEL];

  function handlePreset(val: number) {
    const cents = Math.round(val * 100).toString();
    setRawValue(formatInput(cents));
  }

  function handleInput(text: string) {
    setRawValue(formatInput(text));
  }

  function handleConfirm() {
    if (!isValid) return;
    setShowConfirm(true);
  }

  async function handleSubmit() {
    setShowConfirm(false);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1800)); // simula API
    setIsLoading(false);
    setShowSuccess(true);
  }

  // ── Tela de sucesso ──
  if (showSuccess) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successScreen}>
          <View style={s.successIcon}>
            <Ionicons name="checkmark-circle" size={60} color={colors.primary} />
          </View>
          <Text style={s.successTitle}>Saque solicitado!</Text>
          <Text style={s.successSub}>
            {formatBRL(numericValue)} será creditado em sua conta em até{' '}
            <Text style={{ fontWeight: '700', color: colors.dark1 }}>3 dias úteis</Text>
          </Text>

          <View style={s.successDetails}>
            <View style={s.successRow}>
              <Text style={s.successKey}>Conta</Text>
              <Text style={s.successVal}>{MOCK_ACCOUNT.tipo} · {MOCK_ACCOUNT.chave}</Text>
            </View>
            <View style={s.successRow}>
              <Text style={s.successKey}>Banco</Text>
              <Text style={s.successVal}>{MOCK_ACCOUNT.banco}</Text>
            </View>
            <View style={s.successRow}>
              <Text style={s.successKey}>Prazo</Text>
              <Text style={s.successVal}>Até 3 dias úteis</Text>
            </View>
          </View>

          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={s.doneBtnText}>Voltar para Financeiro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.dark1} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Solicitar Saque</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Saldo ── */}
        <View style={s.balanceCard}>
          <View style={s.balanceRow}>
            <View>
              <Text style={s.balanceLabel}>Disponível para saque</Text>
              <Text style={s.balanceValue}>{formatBRL(SALDO_DISPONIVEL)}</Text>
            </View>
            <View style={s.balanceDivider} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.pendingLabel}>Pendente</Text>
              <Text style={s.pendingValue}>{formatBRL(SALDO_PENDENTE)}</Text>
            </View>
          </View>
          <View style={s.pendingNote}>
            <Ionicons name="information-circle-outline" size={14} color='#AAA' />
            <Text style={s.pendingNoteText}>
              Valores pendentes ficam disponíveis após 48h da conclusão do serviço
            </Text>
          </View>
        </View>

        {/* ── Input de valor ── */}
        <View style={s.inputCard}>
          <Text style={s.inputLabel}>Quanto você quer sacar?</Text>

          <View style={s.currencyRow}>
            <Text style={s.currencySymbol}>R$</Text>
            <TextInput
              style={s.valueInput}
              value={rawValue}
              onChangeText={handleInput}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor="#CCC"
            />
          </View>

          {rawValue && !isValid && (
            <Text style={s.inputError}>
              {numericValue < 10
                ? 'Valor mínimo para saque é R$ 10,00'
                : `Valor maior que o saldo disponível (${formatBRL(SALDO_DISPONIVEL)})`}
            </Text>
          )}

          {/* Atalhos de valor */}
          <View style={s.presetsRow}>
            {presets.map(val => (
              <TouchableOpacity
                key={val}
                style={s.presetBtn}
                onPress={() => handlePreset(val)}
              >
                <Text style={s.presetText}>
                  {val === SALDO_DISPONIVEL ? 'Tudo' : `R$ ${val}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Conta cadastrada ── */}
        <View style={s.sectionTitle}>
          <Text style={s.sectionTitleText}>Conta de destino</Text>
          <TouchableOpacity>
            <Text style={s.sectionTitleAction}>Alterar</Text>
          </TouchableOpacity>
        </View>

        <View style={s.accountCard}>
          <View style={s.accountIcon}>
            <Ionicons name="card-outline" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.accountBanco}>{MOCK_ACCOUNT.banco}</Text>
            <Text style={s.accountTipo}>{MOCK_ACCOUNT.tipo} · {MOCK_ACCOUNT.chave}</Text>
          </View>
          <View style={s.accountBadge}>
            <Text style={s.accountBadgeText}>Principal</Text>
          </View>
        </View>

        {/* ── Prazo ── */}
        <View style={s.prazoCard}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={s.prazoText}>
            Processamento em <Text style={{ fontWeight: '700', color: colors.dark1 }}>1 a 3 dias úteis</Text> após a solicitação
          </Text>
        </View>

        {/* ── Histórico ── */}
        <View style={[s.sectionTitle, { marginTop: 8 }]}>
          <Text style={s.sectionTitleText}>Histórico de saques</Text>
        </View>

        {MOCK_HISTORY.map(item => {
          const cfg = STATUS_CFG[item.status];
          return (
            <View key={item.id} style={s.historyItem}>
              <View style={[s.historyIcon, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={20} color={cfg.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.historyValue}>{formatBRL(item.value)}</Text>
                <Text style={s.historyAccount}>{item.account}</Text>
                <Text style={s.historyDate}>{item.date}</Text>
              </View>
              <View style={[s.historyBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[s.historyBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>
          );
        })}

      </ScrollView>

      {/* ── Botão de solicitar ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.withdrawBtn, (!isValid || isLoading) && s.withdrawBtnDisabled]}
          onPress={handleConfirm}
          disabled={!isValid || isLoading}
        >
          <Ionicons name="arrow-up-circle-outline" size={20} color="#FFF" />
          <Text style={s.withdrawBtnText}>
            {rawValue ? `Sacar ${formatBRL(numericValue)}` : 'Informe o valor'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ══ Modal de confirmação ══ */}
      <Modal visible={showConfirm} transparent animationType="fade" onRequestClose={() => setShowConfirm(false)}>
        <View style={cm.overlay}>
          <View style={cm.card}>
            <View style={cm.iconWrap}>
              <Ionicons name="wallet-outline" size={32} color={colors.primary} />
            </View>
            <Text style={cm.title}>Confirmar saque</Text>
            <Text style={cm.amount}>{formatBRL(numericValue)}</Text>
            <Text style={cm.dest}>Para: {MOCK_ACCOUNT.tipo} · {MOCK_ACCOUNT.chave}</Text>
            <Text style={cm.dest}>{MOCK_ACCOUNT.banco} · Prazo: até 3 dias úteis</Text>

            <View style={cm.actions}>
              <TouchableOpacity style={cm.cancelBtn} onPress={() => setShowConfirm(false)}>
                <Text style={cm.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={cm.confirmBtn} onPress={handleSubmit}>
                <Text style={cm.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.dark1 },
  scroll: { padding: 20, paddingBottom: 40 },

  balanceCard: {
    backgroundColor: colors.dark1, borderRadius: 20, padding: 20, marginBottom: 20,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#AAA', fontSize: 12 },
  balanceValue: { color: '#FFF', fontSize: 26, fontWeight: '700', marginTop: 4 },
  balanceDivider: { width: 1, height: 40, backgroundColor: '#333' },
  pendingLabel: { color: '#AAA', fontSize: 12 },
  pendingValue: { color: '#888', fontSize: 18, fontWeight: '600', marginTop: 4 },
  pendingNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#222' },
  pendingNoteText: { flex: 1, fontSize: 11, color: '#666', lineHeight: 16 },

  inputCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 20, marginBottom: 20,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: 8, marginBottom: 8 },
  currencySymbol: { fontSize: 24, fontWeight: '700', color: '#AAA', marginRight: 8 },
  valueInput: { flex: 1, fontSize: 36, fontWeight: '700', color: colors.dark1 },
  inputError: { fontSize: 12, color: '#F44336', marginTop: 6, marginBottom: 4 },
  presetsRow: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  presetBtn: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: colors.primary + '12', borderWidth: 1, borderColor: colors.primary + '30',
  },
  presetText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleText: { fontSize: 13, fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitleAction: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  accountCard: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    borderWidth: 1.5, borderColor: colors.primary + '40',
  },
  accountIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.primary + '12', justifyContent: 'center', alignItems: 'center',
  },
  accountBanco: { fontSize: 15, fontWeight: '700', color: colors.dark1 },
  accountTipo: { fontSize: 12, color: '#888', marginTop: 2 },
  accountBadge: { backgroundColor: colors.primary + '12', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  accountBadgeText: { fontSize: 11, color: colors.primary, fontWeight: '700' },

  prazoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#FFF', borderRadius: 12, padding: 14,
    marginBottom: 24, borderWidth: 1, borderColor: '#EEE',
  },
  prazoText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 18 },

  historyItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  historyIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  historyValue: { fontSize: 15, fontWeight: '700', color: colors.dark1 },
  historyAccount: { fontSize: 12, color: '#888', marginTop: 2 },
  historyDate: { fontSize: 11, color: '#BBB', marginTop: 2 },
  historyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  historyBadgeText: { fontSize: 10, fontWeight: '700' },

  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  withdrawBtn: {
    backgroundColor: colors.dark1, borderRadius: 14, height: 54,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  withdrawBtnDisabled: { opacity: 0.35 },
  withdrawBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Sucesso
  successScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIcon: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: '700', color: colors.dark1, marginBottom: 8 },
  successSub: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  successDetails: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    width: '100%', gap: 12, marginBottom: 32,
    borderWidth: 1, borderColor: '#E8EEFF',
  },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  successKey: { fontSize: 12, color: '#AAA', fontWeight: '600', textTransform: 'uppercase' },
  successVal: { fontSize: 14, color: '#333', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 10 },
  doneBtn: {
    backgroundColor: colors.dark1, borderRadius: 14, height: 54, width: '100%',
    justifyContent: 'center', alignItems: 'center',
  },
  doneBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

// Modal de confirmação
const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 28, alignItems: 'center',
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.dark1, marginBottom: 8 },
  amount: { fontSize: 32, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  dest: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  cancelBtn: {
    flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#666' },
  confirmBtn: {
    flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.primary,
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});