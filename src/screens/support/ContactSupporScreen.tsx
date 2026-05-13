import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const colors = { primary: '#007AFF' };

export function ContactSupportScreen() {
  return (
    <View style={stylesContact.container}>
      <View style={stylesContact.channelCard}>
        <View style={stylesContact.iconCircle}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={stylesContact.channelTitle}>Chat em Tempo Real</Text>
          <Text style={stylesContact.channelSub}>Tempo médio de espera: 5 min</Text>
        </View>
        <TouchableOpacity style={stylesContact.actionBtn}>
          <Text style={stylesContact.actionBtnText}>Iniciar</Text>
        </TouchableOpacity>
      </View>

      <View style={stylesContact.footer}>
        <Text style={stylesContact.footerTitle}>Documentos Legais</Text>
        {['Termos de Uso', 'Privacidade', 'Cancelamento'].map((item, i) => (
          <TouchableOpacity key={i} style={stylesContact.legalLink}>
            <Text style={stylesContact.legalText}>{item}</Text>
            <Ionicons name="open-outline" size={16} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const stylesContact = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF', padding: 20 },
  channelCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 3 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  channelTitle: { fontWeight: 'bold', fontSize: 16 },
  channelSub: { fontSize: 12, color: '#999', marginTop: 2 },
  actionBtn: { backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  footer: { marginTop: 'auto', paddingBottom: 30 },
  footerTitle: { fontSize: 14, fontWeight: 'bold', color: '#AAA', textTransform: 'uppercase', marginBottom: 15 },
  legalLink: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  legalText: { color: '#666', fontSize: 14 }
});