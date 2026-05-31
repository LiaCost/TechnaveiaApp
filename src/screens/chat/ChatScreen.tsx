import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme';
import { chatService, Message } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// ─── Helpers ──────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

function shouldShowDateSeparator(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const curr = new Date(messages[index].createdAt).toDateString();
  const prev = new Date(messages[index - 1].createdAt).toDateString();
  return curr !== prev;
}

// ─── Subcomponentes ───────────────────────────────────────

function SystemMessage({ content }: { content: string }) {
  return (
    <View style={m.systemWrap}>
      <Text style={m.systemText}>{content}</Text>
    </View>
  );
}

function BudgetCard({ metadados, onPress }: { metadados?: Record<string, unknown>; onPress: () => void }) {
  const total = metadados?.total as number | undefined;
  return (
    <TouchableOpacity style={m.budgetCard} onPress={onPress}>
      <View style={m.budgetHeader}>
        <Ionicons name="receipt" size={18} color="#FFF" />
        <Text style={m.budgetTitle}>Novo Orçamento Recebido</Text>
      </View>
      <View style={m.budgetBody}>
        {total != null && (
          <Text style={m.budgetValue}>Total: R$ {total.toFixed(2).replace('.', ',')}</Text>
        )}
        <View style={m.budgetBtn}>
          <Text style={m.budgetBtnText}>Ver Detalhes e Pagar</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const m = StyleSheet.create({
  systemWrap: {
    alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 4, paddingHorizontal: 14, borderRadius: 20, marginVertical: 10,
  },
  systemText: { fontSize: 12, color: '#666', fontWeight: '500' },
  budgetCard: {
    alignSelf: 'flex-start', maxWidth: '80%', borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.primary,
    marginBottom: 4, backgroundColor: '#FFF',
  },
  budgetHeader: {
    backgroundColor: colors.primary, padding: 10,
    flexDirection: 'row', gap: 8, alignItems: 'center',
  },
  budgetTitle: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  budgetBody: { padding: 14 },
  budgetValue: { fontSize: 18, fontWeight: '700', color: colors.dark1, marginBottom: 10 },
  budgetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary + '12', padding: 10, borderRadius: 10,
  },
  budgetBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13, flex: 1 },
});

function DateSeparator({ label }: { label: string }) {
  return (
    <View style={ds.wrap}>
      <View style={ds.line} />
      <Text style={ds.label}>{label}</Text>
      <View style={ds.line} />
    </View>
  );
}

const ds = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#EEE' },
  label: { marginHorizontal: 10, fontSize: 11, color: '#AAA', fontWeight: '600' },
});

// ─── Tela principal ────────────────────────────────────────

export function ChatScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const conversaId: string = route?.params?.conversaId ?? 'c1';
  const outroNome: string = route?.params?.outroNome ?? 'Ricardo Silva';
  const pedidoNumero: string | undefined = route?.params?.pedidoNumero;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const listRef = useRef<FlatList>(null);

  // Carrega mensagens
  useEffect(() => {
    loadMessages();
  }, [conversaId]);

  async function loadMessages() {
    setIsLoading(true);
    try {
      const data = await chatService.getMessages(conversaId);
      setMessages(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as mensagens.');
    } finally {
      setIsLoading(false);
    }
  }

  // Scroll para o final ao carregar ou receber nova mensagem
  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages.length]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || isSending) return;

    const optimistic: Message = {
      id: `opt_${Date.now()}`,
      conversaId,
      remetenteId: user?.id ?? 'u1',
      tipo: 'text',
      conteudo: text,
      lida: false,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimistic]);
    setInputText('');
    setIsSending(true);
    scrollToEnd();

    try {
      const sent = await chatService.sendMessage(conversaId, { tipo: 'text', conteudo: text });
      setMessages(prev => prev.map(msg => msg.id === optimistic.id ? sent : msg));
    } catch {
      setMessages(prev => prev.filter(msg => msg.id !== optimistic.id));
      setInputText(text);
      Alert.alert('Erro', 'Mensagem não enviada. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  }

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão necessária'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) {
      const optimistic: Message = {
        id: `opt_img_${Date.now()}`,
        conversaId,
        remetenteId: user?.id ?? 'u1',
        tipo: 'image',
        conteudo: result.assets[0].uri,
        lida: false,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimistic]);
      scrollToEnd();
    }
  }

  // ── Renderização de cada mensagem ──
  const isMine = (msg: Message) => msg.remetenteId === (user?.id ?? 'u1');

  function renderMessage({ item: msg, index }: { item: Message; index: number }) {
    const mine = isMine(msg);
    const showSep = shouldShowDateSeparator(messages, index);

    return (
      <>
        {showSep && <DateSeparator label={formatDateSeparator(msg.createdAt)} />}

        {msg.tipo === 'system' && <SystemMessage content={msg.conteudo} />}

        {msg.tipo === 'budget' && (
          <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
            <BudgetCard
              metadados={msg.metadados}
              onPress={() => navigation.navigate('BudgetDetails', { budgetId: msg.metadados?.budgetId })}
            />
            <Text style={s.msgTime}>{formatTime(msg.createdAt)}</Text>
          </View>
        )}

        {(msg.tipo === 'text' || msg.tipo === 'image') && (
          <View style={[s.bubbleRow, mine ? s.bubbleRowMine : s.bubbleRowTheirs]}>
            <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleTheirs]}>
              {msg.tipo === 'image' ? (
                <View style={s.imageThumb}>
                  <Ionicons name="image" size={32} color={mine ? '#FFF' : colors.primary} />
                  <Text style={[s.msgText, mine && s.msgTextMine, { marginTop: 4, fontSize: 11 }]}>
                    Imagem
                  </Text>
                </View>
              ) : (
                <Text style={[s.msgText, mine && s.msgTextMine]}>{msg.conteudo}</Text>
              )}
              <View style={s.metaRow}>
                <Text style={[s.msgTime, mine && s.msgTimeMine]}>{formatTime(msg.createdAt)}</Text>
                {mine && (
                  <Ionicons
                    name={msg.lida ? 'checkmark-done' : 'checkmark'}
                    size={14}
                    color={msg.lida ? colors.primary : 'rgba(255,255,255,0.5)'}
                    style={{ marginLeft: 3 }}
                  />
                )}
              </View>
            </View>
          </View>
        )}
      </>
    );
  }

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={s.headerAvatar}>
          <Text style={s.headerAvatarText}>
            {outroNome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
          </Text>
          <View style={s.onlineDot} />
        </View>

        <View style={s.headerInfo}>
          <Text style={s.headerName} numberOfLines={1}>{outroNome}</Text>
          <Text style={s.headerStatus}>online agora</Text>
        </View>

        {pedidoNumero && (
          <TouchableOpacity
            style={s.orderBadge}
            onPress={() => navigation.navigate('OrderDetail', { orderId: route?.params?.pedidoId })}
          >
            <Ionicons name="document-text" size={16} color={colors.primary} />
            <Text style={s.orderBadgeText}>{pedidoNumero}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Mensagens ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
          />
        )}

        {/* ── Input ── */}
        <View style={s.inputArea}>
          <TouchableOpacity style={s.attachBtn} onPress={handlePickImage}>
            <Ionicons name="add" size={26} color="#666" />
          </TouchableOpacity>

          <View style={s.inputWrap}>
            <TextInput
              style={s.input}
              placeholder="Escreva sua mensagem..."
              placeholderTextColor="#AAA"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
            {inputText.length > 0 && (
              <TouchableOpacity onPress={() => setInputText('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#CCC" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[s.sendBtn, inputText.trim() && s.sendBtnActive]}
            onPress={inputText.trim() ? handleSend : undefined}
            disabled={isSending}
          >
            <Ionicons
              name={inputText.trim() ? 'send' : 'mic'}
              size={20}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Estilos ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, backgroundColor: '#FFF',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  headerBack: { padding: 4, marginRight: 8 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative', marginRight: 10,
  },
  headerAvatarText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFF',
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: '700', color: '#222' },
  headerStatus: { fontSize: 11, color: '#4CAF50', fontWeight: '500' },
  orderBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary + '12',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  orderBadgeText: { color: colors.primary, fontSize: 12, fontWeight: '700' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingVertical: 12, paddingBottom: 4 },

  bubbleRow: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 4 },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '78%', borderRadius: 18, padding: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3,
  },
  bubbleMine: {
    backgroundColor: colors.dark1,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
  },

  msgText: { fontSize: 15, color: '#333', lineHeight: 21 },
  msgTextMine: { color: '#FFF' },

  imageThumb: { alignItems: 'center', padding: 8 },

  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  msgTime: { fontSize: 10, color: '#AAA' },
  msgTimeMine: { color: 'rgba(255,255,255,0.5)' },

  inputArea: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 10, backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#EEE', gap: 8,
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center',
  },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#F0F2F5', borderRadius: 22,
    paddingHorizontal: 14, paddingVertical: 8, minHeight: 40, maxHeight: 120,
  },
  input: { flex: 1, fontSize: 15, color: '#222', maxHeight: 100 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#CCC', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnActive: { backgroundColor: colors.primary },
});