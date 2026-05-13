import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function ChatScreen() {
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      {/* Header do Chat */}
      <View style={styles.chatHeader}>
        <TouchableOpacity><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Ricardo Silva</Text>
          <Text style={styles.headerStatus}>online agora</Text>
        </View>
        <TouchableOpacity style={styles.orderBadge}>
          <Ionicons name="document-text" size={18} color={colors.primary} />
          <Text style={styles.orderBadgeText}>Pedido #88</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.messagesList}>
        {/* Balão de Mensagem do Sistema */}
        <View style={styles.systemMsg}>
          <Text style={styles.systemMsgText}>O técnico iniciou o deslocamento às 14:05</Text>
        </View>

        {/* Mensagem Recebida */}
        <View style={styles.bubbleReceived}>
          <Text style={styles.msgText}>Olá! Estou a caminho do seu endereço. O trânsito está tranquilo.</Text>
          <Text style={styles.msgTime}>14:06</Text>
        </View>

        {/* Balão de Orçamento (Interativo) */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Ionicons name="receipt" size={20} color="#FFF" />
            <Text style={styles.budgetTitle}>Novo Orçamento Recebido</Text>
          </View>
          <View style={styles.budgetBody}>
            <Text style={styles.budgetValue}>Total: R$ 315,00</Text>
            <TouchableOpacity style={styles.viewBudgetBtn}>
              <Text style={styles.viewBudgetText}>Ver Detalhes e Pagar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mensagem Enviada */}
        <View style={styles.bubbleSent}>
          <Text style={styles.msgTextSent}>Perfeito, estarei aguardando!</Text>
          <View style={styles.row}>
            <Text style={styles.msgTimeSent}>14:10</Text>
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
          </View>
        </View>
      </ScrollView>

      {/* Input de Mensagem */}
      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="add" size={28} color="#666" />
        </TouchableOpacity>
        
        <View style={styles.textInputContainer}>
          <TextInput placeholder="Escreva sua mensagem..." style={styles.input} />
          <TouchableOpacity><Ionicons name="happy-outline" size={24} color="#999" /></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sendBtn}>
          <Ionicons name="mic" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#FFF', elevation: 2 },
  headerInfo: { flex: 1, marginLeft: 15 },
  headerName: { fontWeight: 'bold', fontSize: 16 },
  headerStatus: { fontSize: 12, color: '#4CAF50' },
  orderBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', padding: 8, borderRadius: 10, gap: 5 },
  orderBadgeText: { color: colors.primary, fontSize: 12, fontWeight: 'bold' },
  
  messagesList: { padding: 15 },
  systemMsg: { alignSelf: 'center', backgroundColor: '#DDD', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20, marginVertical: 15 },
  systemMsgText: { fontSize: 11, color: '#666', fontWeight: '600' },
  
  bubbleReceived: { alignSelf: 'flex-start', backgroundColor: '#FFF', padding: 12, borderRadius: 15, borderTopLeftRadius: 0, maxWidth: '80%', marginBottom: 10 },
  bubbleSent: { alignSelf: 'flex-end', backgroundColor: colors.dark1, padding: 12, borderRadius: 15, borderTopRightRadius: 0, maxWidth: '80%', marginBottom: 10 },
  msgText: { color: '#333', fontSize: 15 },
  msgTextSent: { color: '#FFF', fontSize: 15 },
  msgTime: { fontSize: 10, color: '#999', marginTop: 5, alignSelf: 'flex-end' },
  msgTimeSent: { fontSize: 10, color: '#AAA', marginTop: 5, marginRight: 5 },
  
  budgetCard: { backgroundColor: '#FFF', borderRadius: 15, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: colors.primary },
  budgetHeader: { backgroundColor: colors.primary, padding: 10, flexDirection: 'row', gap: 10 },
  budgetTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  budgetBody: { padding: 15, alignItems: 'center' },
  budgetValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  viewBudgetBtn: { backgroundColor: colors.primary + '15', padding: 10, borderRadius: 10, width: '100%', alignItems: 'center' },
  viewBudgetText: { color: colors.primary, fontWeight: 'bold' },

  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#FFF', gap: 10 },
  textInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 25, paddingHorizontal: 15 },
  input: { flex: 1, paddingVertical: 10, fontSize: 15 },
  attachBtn: { justifyContent: 'center', alignItems: 'center' },
  sendBtn: { width: 45, height: 45, borderRadius: 23, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }
});