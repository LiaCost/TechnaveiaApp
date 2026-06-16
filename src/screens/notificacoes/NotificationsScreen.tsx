import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, StatusBar,
  FlatList, TouchableOpacity, ScrollView, 
  Switch, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { notificationService, Notification, ApiError } from '../../services/api';

// Configuração de Estilos por Tipo
const notificationConfig: any = {
  request: { icon: 'briefcase', color: '#2196F3', label: 'Pedido' },
  payment: { icon: 'cash', color: '#4CAF50', label: 'Pagamento' },
  budget: { icon: 'receipt', color: '#FF9800', label: 'Orçamento' },
  message: { icon: 'chatbubbles', color: colors.primary, label: 'Mensagem' },
  system: { icon: 'notifications', color: '#607D8B', label: 'Sistema' },
  evaluation: { icon: 'star', color: '#FFC107', label: 'Avaliação' },
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return 'Agora';
  if (diff < 60) return `${Math.floor(diff)} min`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const data = await notificationService.list();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      {/* Header com Ação */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Notificações</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Limpar tudo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons name="notifications-off-outline" size={48} color="#DDD" />
              <Text style={{ color: '#AAA', marginTop: 12 }}>Nenhuma notificação ainda</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const config = notificationConfig[item.tipo] ?? notificationConfig.system;
          return (
            <TouchableOpacity style={[styles.notifCard, !item.lida && styles.notifUnread]}>
              <View style={[styles.iconBox, { backgroundColor: config.color + '15' }]}>
                <Ionicons name={config.icon} size={22} color={config.color} />
              </View>
              
              <View style={{ flex: 1, marginLeft: 15 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.notifLabel}>{config.label}</Text>
                  <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={styles.notifTitle}>{item.titulo}</Text>
                <Text style={styles.notifDesc} numberOfLines={2}>{item.descricao}</Text>
              </View>

              {!item.lida && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    push: true,
    email: false,
    sms: false,
    silenceMode: false
  });

  return (
    <ScrollView style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Como deseja ser notificado?</Text>
      
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Notificações Push</Text>
            <Text style={styles.settingSub}>Alertas em tempo real no celular</Text>
          </View>
          <Switch value={settings.push} onValueChange={(v) => setSettings({...settings, push: v})} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>E-mail</Text>
            <Text style={styles.settingSub}>Resumos diários e notas fiscais</Text>
          </View>
          <Switch value={settings.email} onValueChange={(v) => setSettings({...settings, email: v})} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Modo Não Perturbe</Text>
            <Text style={styles.settingSub}>Silenciar entre 22:00 e 08:00</Text>
          </View>
          <Switch 
            value={settings.silenceMode} 
            trackColor={{ true: colors.primary }}
            onValueChange={(v) => setSettings({...settings, silenceMode: v})} 
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  markReadText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  notifCard: { flexDirection: 'row', padding: 20, backgroundColor: '#FFF', marginBottom: 1, alignItems: 'center' },
  notifUnread: { backgroundColor: colors.primary + '05' },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  notifLabel: { fontSize: 10, fontWeight: 'bold', color: '#999', textTransform: 'uppercase' },
  notifTime: { fontSize: 11, color: '#AAA' },
  notifTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  notifDesc: { fontSize: 13, color: '#666', marginTop: 2, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: 10 },
  
  // Settings Styles
  settingsContainer: { flex: 1, padding: 20 },
  settingsTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 20 },
  settingsCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 2 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  settingLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  settingSub: { fontSize: 12, color: '#999', marginTop: 2 }
});