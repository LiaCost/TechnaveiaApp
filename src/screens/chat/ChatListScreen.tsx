import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { chatService, Conversation, ApiError } from '../../services/api';

export function ChatListScreen({ navigation }: any) {
  const [activeTab, setActiveTab]       = useState('Ativas');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [query, setQuery]               = useState('');
  const insets = useSafeAreaInsets();

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await chatService.listConversations();
      setConversations(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não foi possível carregar as conversas.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Recarrega ao focar a tela (volta do chat)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    load(true);
  }

  // Filtragem por aba e busca
  const filtered = conversations.filter(c => {
    const matchQuery = c.outroUsuario.nome.toLowerCase().includes(query.toLowerCase()) ||
      (c.ultimaMensagem?.conteudo ?? '').toLowerCase().includes(query.toLowerCase());
    const matchTab = activeTab === 'Ativas' ? !c.encerrado : !!c.encerrado;
    return matchQuery && matchTab;
  });

  function formatTime(iso: string): string {
    const date = new Date(iso);
    const now  = new Date();
    const diffH = (now.getTime() - date.getTime()) / 3600000;
    if (diffH < 24) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (diffH < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  function handleOpen(conv: Conversation) {
    navigation.navigate('Chat', {
      conversaId: conv.id,
      outroNome: conv.outroUsuario.nome,
      outroFoto: conv.outroUsuario.foto,
      pedidoId: conv.pedidoId,
      chatEncerrado: conv.encerrado ?? false,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.title}>Mensagens</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              placeholder="Buscar conversas..."
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholderTextColor="#AAA"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color="#AAA" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ flex: 1, backgroundColor: '#F8F9FF' }}>
          {/* Tabs */}
          <View style={styles.tabs}>
            {['Ativas', 'Finalizadas'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Ionicons name="alert-circle-outline" size={40} color="#CCC" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                {query ? 'Nenhuma conversa encontrada.' : 'Nenhuma conversa ainda.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.chatCard} onPress={() => handleOpen(item)}>
                  <View>
                    <View style={[styles.avatar, item.outroUsuario.online && styles.avatarOnline]}>
                      {item.outroUsuario.foto ? (
                        <Image source={{ uri: item.outroUsuario.foto }} style={{ width: 60, height: 60, borderRadius: 30 }} />
                      ) : (
                        <Text style={styles.avatarInitials}>
                          {item.outroUsuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </Text>
                      )}
                    </View>
                    {item.outroUsuario.online && <View style={styles.onlineBadge} />}
                  </View>

                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.userName} numberOfLines={1}>{item.outroUsuario.nome}</Text>
                      <Text style={styles.timeText}>
                        {item.updatedAt ? formatTime(item.updatedAt) : ''}
                      </Text>
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.lastMsg, item.naoLidas > 0 && styles.lastMsgUnread]} numberOfLines={1}>
                        {item.ultimaMensagem?.conteudo ?? 'Nenhuma mensagem ainda'}
                      </Text>
                      {item.naoLidas > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>
                            {item.naoLidas > 9 ? '9+' : item.naoLidas}
                          </Text>
                        </View>
                      )}
                    </View>
                    {item.encerrado && (
                      <View style={styles.finDateRow}>
                        <Ionicons name="checkmark-done" size={12} color="#999" />
                        <Text style={styles.finDateText}>
                          Finalizada em {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFF',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, zIndex: 1,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5',
    paddingHorizontal: 15, borderRadius: 15, height: 45,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 20 },
  tab: { paddingBottom: 8, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 16, fontWeight: '600', color: '#999' },
  tabTextActive: { color: colors.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  errorText: { color: '#999', marginTop: 10, textAlign: 'center' },
  retryBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 10 },
  retryText: { color: '#FFF', fontWeight: '700' },
  emptyText: { color: '#AAA', marginTop: 12, fontSize: 15, textAlign: 'center' },
  chatCard: {
    flexDirection: 'row', padding: 15, marginHorizontal: 20, marginVertical: 8,
    backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarOnline: { borderWidth: 2, borderColor: '#4CAF50' },
  avatarInitials: { fontSize: 18, fontWeight: '700', color: colors.primary },
  onlineBadge: {
    position: 'absolute', right: 0, bottom: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFF',
  },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 8 },
  lastMsg: { fontSize: 14, color: '#777', marginTop: 4, flex: 1 },
  lastMsgUnread: { fontWeight: '600', color: '#333' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeText: { fontSize: 12, color: '#AAA' },
  unreadBadge: {
    backgroundColor: colors.primary, minWidth: 20, height: 20,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  finDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  finDateText: { fontSize: 11, color: '#999' },
});
