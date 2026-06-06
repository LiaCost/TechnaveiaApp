import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <SafeAreaView style={stylesSettings.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />
      <View style={stylesSettings.container}>
        <View style={stylesSettings.settingsGroup}>
          <Text style={stylesSettings.groupTitle}>Segurança</Text>
          <TouchableOpacity style={stylesSettings.settingRow}>
            <Text style={stylesSettings.settingLabel}>Alterar Senha</Text>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={stylesSettings.settingRow}>
            <Text style={stylesSettings.settingLabel}>Autenticação em dois fatores (2FA)</Text>
            <Text style={stylesSettings.settingValue}>Ativar</Text>
          </TouchableOpacity>
        </View>

        <View style={stylesSettings.settingsGroup}>
          <Text style={stylesSettings.groupTitle}>Preferências</Text>
          <View style={stylesSettings.settingRow}>
            <Text style={stylesSettings.settingLabel}>Tema Escuro</Text>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>
        </View>

        <TouchableOpacity style={stylesSettings.deleteBtn}>
          <Text style={stylesSettings.deleteBtnText}>Excluir minha conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const stylesSettings = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FF',
  },
  settingsGroup: { 
    backgroundColor: '#FFF', 
    paddingHorizontal: 20, 
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  groupTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#AAA', 
    textTransform: 'uppercase', 
    paddingVertical: 15,
  },
  settingRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15, 
    borderTopWidth: 1, 
    borderTopColor: '#F5F5F5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  deleteBtn: { 
    marginTop: 50, 
    padding: 20, 
    alignItems: 'center',
  },
  deleteBtnText: { 
    color: '#FF4B4B', 
    fontSize: 14, 
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});