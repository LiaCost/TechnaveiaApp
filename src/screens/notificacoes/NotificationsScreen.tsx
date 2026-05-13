import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  FlatList, TouchableOpacity, ScrollView, 
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

// Configuração de Estilos por Tipo
const notificationConfig: any = {
  request: { icon: 'briefcase', color: '#2196F3', label: 'Novo Pedido' },
  payment: { icon: 'cash', color: '#4CAF50', label: 'Pagamento' },
  budget: { icon: 'receipt', color: '#FF9800', label: 'Orçamento' },
  message: { icon: 'chatbubbles', color: colors.primary, label: 'Mensagem' },
  system: { icon: 'notifications', color: '#607D8B', label: 'Sistema' },
};

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'request', title: 'Nova solicitação!', desc: 'Formatação de PC em Santana disponível.', time: '2 min', read: false },
    { id: '2', type: 'payment', title: 'Pagamento Confirmado', desc: 'O valor do pedido #8829 já está no seu saldo.', time: '1h', read: false },
    { id: '3', type: 'budget', title: 'Orçamento Recebido', desc: 'O técnico Ricardo enviou uma proposta.', time: '3h', read: true },
    { id: '4', type: 'message', title: 'Nova Mensagem', desc: 'Ana: "Pode vir amanhã às 10h?"', time: '5h', read: true },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com Ação */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificações</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Limpar tudo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const config = notificationConfig[item.type];
          return (
            <TouchableOpacity style={[styles.notifCard, !item.read && styles.notifUnread]}>
              <View style={[styles.iconBox, { backgroundColor: config.color + '15' }]}>
                <Ionicons name={config.icon} size={22} color={config.color} />
              </View>
              
              <View style={{ flex: 1, marginLeft: 15 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.notifLabel}>{config.label}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifDesc} numberOfLines={2}>{item.desc}</Text>
              </View>

              {!item.read && <View style={styles.unreadDot} />}
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