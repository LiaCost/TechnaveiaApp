import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, Switch, Modal,
  Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Tipos ────────────────────────────────────────────────

type Audience = 'todos' | 'clientes' | 'tecnicos' | 'inativos';
type CouponType = 'percentual' | 'fixo';

interface Coupon {
  id: string;
  codigo: string;
  tipo: CouponType;
  valor: number;
  minPedido?: number;
  usos: number;
  limite: number;
  ativo: boolean;
  validade: string;
}

// ─── Mock ─────────────────────────────────────────────────

const MOCK_COUPONS: Coupon[] = [
  { id: 'c1', codigo: 'BEMVINDO10', tipo: 'percentual', valor: 10, usos: 45, limite: 100, ativo: true, validade: '30 Jun 2026' },
  { id: 'c2', codigo: 'TECH30OFF', tipo: 'fixo', valor: 30, minPedido: 100, usos: 12, limite: 50, ativo: true, validade: '15 Jun 2026' },
  { id: 'c3', codigo: 'VERAO2026', tipo: 'percentual', valor: 15, usos: 50, limite: 50, ativo: false, validade: '01 Mar 2026' },
];

const AUDIENCE_OPTIONS: { key: Audience; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'todos',     label: 'Todos os usuários', desc: '~1.284 pessoas', icon: 'people-outline' },
  { key: 'clientes',  label: 'Apenas clientes',   desc: '~950 pessoas',  icon: 'person-outline' },
  { key: 'tecnicos',  label: 'Apenas técnicos',   desc: '~334 pessoas',  icon: 'construct-outline' },
  { key: 'inativos',  label: 'Usuários inativos', desc: '~120 pessoas',  icon: 'time-outline' },
];

// ─── Seção colapsável ─────────────────────────────────────

function Section({ title, icon, children, defaultOpen = false }: {
  title: string; icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={sec.wrap}>
      <TouchableOpacity style={sec.header} onPress={() => setOpen(o => !o)}>
        <View style={sec.iconWrap}>
          <Ionicons name={icon} size={18} color="#FFF" />
        </View>
        <Text style={sec.title}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#AAA" />
      </TouchableOpacity>
      {open && <View style={sec.body}>{children}</View>}
    </View>
  );
}

const sec = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFF', borderRadius: 18, marginBottom: 14,
    overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center',
  },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: '#222' },
  body: { padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
});

// ─── Tela principal ────────────────────────────────────────

export function CommunicationsScreen({ navigation }: any) {
  // Push
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [audience, setAudience] = useState<Audience>('todos');
  const [sendPush, setSendPush] = useState({ push: true, email: false, sms: false });

  // Cupom
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [showNewCoupon, setShowNewCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    codigo: '', tipo: 'percentual' as CouponType,
    valor: '', minPedido: '', limite: '', validade: '',
  });

  function handleSendPush() {
    if (!pushTitle.trim() || !pushBody.trim()) {
      Alert.alert('Preencha o título e a mensagem');
      return;
    }
    const audienceLabel = AUDIENCE_OPTIONS.find(a => a.key === audience)?.desc ?? '';
    Alert.alert(
      'Confirmar envio?',
      `Enviar notificação para ${audienceLabel}?\n\n"${pushTitle}"`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar agora',
          onPress: () => {
            setPushTitle('');
            setPushBody('');
            Alert.alert('Enviado!', 'Notificação enviada com sucesso.');
          },
        },
      ]
    );
  }

  function handleCreateCoupon() {
    if (!newCoupon.codigo || !newCoupon.valor || !newCoupon.limite) {
      Alert.alert('Preencha os campos obrigatórios');
      return;
    }
    const coupon: Coupon = {
      id: Date.now().toString(),
      codigo: newCoupon.codigo.toUpperCase(),
      tipo: newCoupon.tipo,
      valor: parseFloat(newCoupon.valor),
      minPedido: newCoupon.minPedido ? parseFloat(newCoupon.minPedido) : undefined,
      usos: 0,
      limite: parseInt(newCoupon.limite),
      ativo: true,
      validade: newCoupon.validade || '–',
    };
    setCoupons(prev => [coupon, ...prev]);
    setNewCoupon({ codigo: '', tipo: 'percentual', valor: '', minPedido: '', limite: '', validade: '' });
    setShowNewCoupon(false);
    Alert.alert('Cupom criado!', `O cupom ${coupon.codigo} está ativo.`);
  }

  function toggleCoupon(id: string) {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c));
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2F5" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Comunicações</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Push global ── */}
        <Section title="Enviar notificação" icon="notifications-outline" defaultOpen>
          <Text style={s.fieldLabel}>Público-alvo</Text>
          <View style={s.audienceGrid}>
            {AUDIENCE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[s.audienceCard, audience === opt.key && s.audienceCardActive]}
                onPress={() => setAudience(opt.key)}
              >
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={audience === opt.key ? '#FFF' : '#666'}
                />
                <Text style={[s.audienceLabel, audience === opt.key && { color: '#FFF' }]}>
                  {opt.label}
                </Text>
                <Text style={[s.audienceDesc, audience === opt.key && { color: 'rgba(255,255,255,0.7)' }]}>
                  {opt.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.fieldLabel}>Título da notificação</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: Promoção de fim de semana!"
            placeholderTextColor="#BBB"
            value={pushTitle}
            onChangeText={setPushTitle}
            maxLength={60}
          />
          <Text style={s.charCount}>{pushTitle.length}/60</Text>

          <Text style={s.fieldLabel}>Mensagem</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Ex: Aproveite 20% de desconto em serviços de rede neste fim de semana!"
            placeholderTextColor="#BBB"
            value={pushBody}
            onChangeText={setPushBody}
            multiline
            maxLength={180}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{pushBody.length}/180</Text>

          <Text style={s.fieldLabel}>Canais de envio</Text>
          <View style={s.channelsRow}>
            {(['push', 'email', 'sms'] as const).map(ch => (
              <TouchableOpacity
                key={ch}
                style={[s.channelChip, sendPush[ch] && s.channelChipActive]}
                onPress={() => setSendPush(prev => ({ ...prev, [ch]: !prev[ch] }))}
              >
                <Ionicons
                  name={ch === 'push' ? 'phone-portrait-outline' : ch === 'email' ? 'mail-outline' : 'chatbubble-outline'}
                  size={16}
                  color={sendPush[ch] ? '#FFF' : '#666'}
                />
                <Text style={[s.channelText, sendPush[ch] && { color: '#FFF' }]}>
                  {ch.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.sendBtn} onPress={handleSendPush}>
            <Ionicons name="send-outline" size={18} color="#FFF" />
            <Text style={s.sendBtnText}>Enviar notificação</Text>
          </TouchableOpacity>
        </Section>

        {/* ── Cupons ── */}
        <Section title="Cupons de desconto" icon="pricetag-outline">
          <TouchableOpacity
            style={s.newCouponBtn}
            onPress={() => setShowNewCoupon(true)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#1a1a1a" />
            <Text style={s.newCouponText}>Criar novo cupom</Text>
          </TouchableOpacity>

          {coupons.map(coupon => (
            <View key={coupon.id} style={[s.couponCard, !coupon.ativo && s.couponCardInactive]}>
              <View style={s.couponLeft}>
                <View style={s.couponCodeWrap}>
                  <Text style={s.couponCode}>{coupon.codigo}</Text>
                </View>
                <View style={s.couponInfo}>
                  <Text style={s.couponDiscount}>
                    {coupon.tipo === 'percentual' ? `${coupon.valor}% off` : `R$ ${coupon.valor} off`}
                    {coupon.minPedido ? ` (mín. R$ ${coupon.minPedido})` : ''}
                  </Text>
                  <Text style={s.couponMeta}>
                    {coupon.usos}/{coupon.limite} usos · válido até {coupon.validade}
                  </Text>
                  {/* Barra de progresso de uso */}
                  <View style={s.usageBar}>
                    <View style={[s.usageFill, { width: `${Math.min((coupon.usos / coupon.limite) * 100, 100)}%` }]} />
                  </View>
                </View>
              </View>
              <Switch
                value={coupon.ativo}
                onValueChange={() => toggleCoupon(coupon.id)}
                trackColor={{ true: '#4CAF50' + '60' }}
                thumbColor={coupon.ativo ? '#4CAF50' : '#CCC'}
              />
            </View>
          ))}
        </Section>

        {/* ── Histórico de comunicações ── */}
        <Section title="Histórico de envios" icon="time-outline">
          {[
            { titulo: 'Promoção de Mães', audiencia: 'Todos', enviado: '12 Mai 2026', alcance: '1.201' },
            { titulo: 'Bem-vindo ao TechNaVeia!', audiencia: 'Novos usuários', enviado: '01 Mai 2026', alcance: '48' },
            { titulo: 'Avaliação pendente', audiencia: 'Clientes', enviado: '28 Abr 2026', alcance: '320' },
          ].map((item, i) => (
            <View key={i} style={s.historyItem}>
              <View style={s.historyIcon}>
                <Ionicons name="notifications-outline" size={16} color="#666" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.historyTitle}>{item.titulo}</Text>
                <Text style={s.historyMeta}>{item.audiencia} · {item.enviado}</Text>
              </View>
              <View style={s.reachBadge}>
                <Ionicons name="people-outline" size={12} color="#1565C0" />
                <Text style={s.reachText}>{item.alcance}</Text>
              </View>
            </View>
          ))}
        </Section>

      </ScrollView>

      {/* Modal novo cupom */}
      <Modal visible={showNewCoupon} transparent animationType="slide" onRequestClose={() => setShowNewCoupon(false)}>
        <View style={nc.overlay}>
          <View style={nc.sheet}>
            <View style={nc.handle} />
            <View style={nc.header}>
              <Text style={nc.title}>Novo cupom</Text>
              <TouchableOpacity onPress={() => setShowNewCoupon(false)}>
                <Ionicons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={s.fieldLabel}>Código do cupom <Text style={{ color: '#F44336' }}>*</Text></Text>
              <TextInput
                style={s.input}
                placeholder="Ex: DESCONTO20"
                placeholderTextColor="#BBB"
                value={newCoupon.codigo}
                onChangeText={v => setNewCoupon(p => ({ ...p, codigo: v.toUpperCase() }))}
                autoCapitalize="characters"
              />

              <Text style={s.fieldLabel}>Tipo de desconto</Text>
              <View style={s.typeRow}>
                {(['percentual', 'fixo'] as CouponType[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[s.typeChip, newCoupon.tipo === t && s.typeChipActive]}
                    onPress={() => setNewCoupon(p => ({ ...p, tipo: t }))}
                  >
                    <Text style={[s.typeText, newCoupon.tipo === t && { color: '#FFF' }]}>
                      {t === 'percentual' ? '% Percentual' : 'R$ Fixo'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.fieldLabel}>
                Valor {newCoupon.tipo === 'percentual' ? '(%)' : '(R$)'} <Text style={{ color: '#F44336' }}>*</Text>
              </Text>
              <TextInput
                style={s.input}
                placeholder={newCoupon.tipo === 'percentual' ? 'Ex: 10' : 'Ex: 30'}
                placeholderTextColor="#BBB"
                keyboardType="numeric"
                value={newCoupon.valor}
                onChangeText={v => setNewCoupon(p => ({ ...p, valor: v }))}
              />

              <Text style={s.fieldLabel}>Pedido mínimo (R$)</Text>
              <TextInput
                style={s.input}
                placeholder="Ex: 100 (opcional)"
                placeholderTextColor="#BBB"
                keyboardType="numeric"
                value={newCoupon.minPedido}
                onChangeText={v => setNewCoupon(p => ({ ...p, minPedido: v }))}
              />

              <Text style={s.fieldLabel}>Limite de usos <Text style={{ color: '#F44336' }}>*</Text></Text>
              <TextInput
                style={s.input}
                placeholder="Ex: 100"
                placeholderTextColor="#BBB"
                keyboardType="numeric"
                value={newCoupon.limite}
                onChangeText={v => setNewCoupon(p => ({ ...p, limite: v }))}
              />

              <Text style={s.fieldLabel}>Válido até</Text>
              <TextInput
                style={s.input}
                placeholder="Ex: 30 Jun 2026"
                placeholderTextColor="#BBB"
                value={newCoupon.validade}
                onChangeText={v => setNewCoupon(p => ({ ...p, validade: v }))}
              />

              <TouchableOpacity style={s.sendBtn} onPress={handleCreateCoupon}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                <Text style={s.sendBtnText}>Criar cupom</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F2F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1a1a1a', padding: 20, paddingTop: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  scroll: { padding: 16, paddingBottom: 40 },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 14 },
  input: {
    backgroundColor: '#F8F9FF', borderWidth: 1, borderColor: '#E0E4F0',
    borderRadius: 12, padding: 14, fontSize: 14, color: '#222',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#AAA', textAlign: 'right', marginTop: 4 },

  audienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  audienceCard: {
    width: '47%', backgroundColor: '#F8F9FF', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#E0E4F0', alignItems: 'flex-start', gap: 4,
  },
  audienceCardActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  audienceLabel: { fontSize: 13, fontWeight: '700', color: '#333' },
  audienceDesc: { fontSize: 11, color: '#AAA' },

  channelsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  channelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#E0E4F0',
  },
  channelChipActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  channelText: { fontSize: 12, fontWeight: '700', color: '#666' },

  sendBtn: {
    backgroundColor: '#1a1a1a', borderRadius: 14, height: 50,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 10, marginTop: 16,
  },
  sendBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  newCouponBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F8F9FF', borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#1a1a1a',
    marginBottom: 14,
  },
  newCouponText: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },

  couponCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#E8EEFF',
  },
  couponCardInactive: { opacity: 0.5 },
  couponLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 8 },
  couponCodeWrap: {
    backgroundColor: '#1a1a1a', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8,
  },
  couponCode: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  couponInfo: { flex: 1 },
  couponDiscount: { fontSize: 13, fontWeight: '700', color: '#222' },
  couponMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  usageBar: { height: 3, backgroundColor: '#E0E0E0', borderRadius: 2, marginTop: 6 },
  usageFill: { height: 3, backgroundColor: '#4CAF50', borderRadius: 2 },

  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: {
    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#E0E4F0',
  },
  typeChipActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  typeText: { fontSize: 13, fontWeight: '700', color: '#666' },

  historyItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  historyIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center',
  },
  historyTitle: { fontSize: 14, fontWeight: '600', color: '#222' },
  historyMeta: { fontSize: 12, color: '#AAA', marginTop: 2 },
  reachBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  reachText: { fontSize: 11, color: '#1565C0', fontWeight: '700' },
});

const nc = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingTop: 12, maxHeight: '90%',
  },
  handle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', color: '#222' },
});