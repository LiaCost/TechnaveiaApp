import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator, Image,
  Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

export function EditProfileScreen({ navigation }: any) {
  const { user, signIn, userToken, userType } = useAuth();

  const [nome, setNome] = useState(user?.nome ?? '');
  const [foto, setFoto] = useState(user?.foto ?? '');
  const [saving, setSaving] = useState(false);

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para trocar a foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      // Usa base64 data URI para salvar como string no banco
      const asset = result.assets[0];
      const base64Uri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setFoto(base64Uri);
    }
  }

  function removePhoto() {
    Alert.alert('Remover foto?', 'Sua foto de perfil será removida.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => setFoto('') },
    ]);
  }

  async function handleSave() {
    if (!nome.trim()) {
      Alert.alert('Nome obrigatório', 'Informe seu nome.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      const res = await fetch(`${BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: nome.trim(), foto: foto || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Erro ao salvar');
      }
      const json = await res.json();
      const updatedUser = json.data ?? json;

      // Atualiza o contexto de auth com os novos dados
      if (userToken && userType) {
        await signIn(userToken, userType, {
          id: user?.id ?? updatedUser.id,
          nome: updatedUser.nome ?? nome,
          email: user?.email ?? updatedUser.email,
          foto: updatedUser.foto ?? foto,
        });
      }

      Alert.alert('Salvo!', 'Seu perfil foi atualizado.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  const initials = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <SafeAreaView style={st.safe}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={st.scroll}>
        {/* Foto */}
        <View style={st.photoSection}>
          <View style={st.avatarWrap}>
            {foto ? (
              <Image source={{ uri: foto }} style={st.avatarImage} />
            ) : (
              <View style={st.avatarPlaceholder}>
                <Text style={st.avatarInitials}>{initials || '?'}</Text>
              </View>
            )}
            <TouchableOpacity style={st.cameraBtn} onPress={pickPhoto}>
              <Ionicons name="camera" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={st.photoActions}>
            <TouchableOpacity style={st.photoBtn} onPress={pickPhoto}>
              <Ionicons name="image-outline" size={18} color={colors.primary} />
              <Text style={st.photoBtnText}>Trocar foto</Text>
            </TouchableOpacity>
            {foto ? (
              <TouchableOpacity style={[st.photoBtn, st.photoBtnDanger]} onPress={removePhoto}>
                <Ionicons name="trash-outline" size={18} color="#C62828" />
                <Text style={[st.photoBtnText, { color: '#C62828' }]}>Remover</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Campos */}
        <View style={st.formSection}>
          <Text style={st.label}>Nome completo</Text>
          <TextInput
            style={st.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
            placeholderTextColor="#AAA"
          />

          <Text style={st.label}>E-mail</Text>
          <View style={[st.input, st.inputDisabled]}>
            <Text style={st.disabledText}>{user?.email ?? ''}</Text>
          </View>
          <Text style={st.hint}>O e-mail não pode ser alterado por aqui.</Text>
        </View>
      </ScrollView>

      {/* Botão Salvar */}
      <View style={st.footer}>
        <TouchableOpacity
          style={[st.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#FFF" />
            : <Text style={st.saveBtnText}>Salvar alterações</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: {
    flex: 1, backgroundColor: '#F8F9FF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 40 },

  photoSection: { alignItems: 'center', marginBottom: 30 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 36, fontWeight: '700', color: colors.primary },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFF',
  },
  photoActions: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.primary + '12',
  },
  photoBtnDanger: { backgroundColor: '#FFEBEE' },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  formSection: { backgroundColor: '#FFF', borderRadius: 18, padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#F8F9FF', borderWidth: 1, borderColor: '#E0E4F0',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#222',
  },
  inputDisabled: { backgroundColor: '#F0F0F0' },
  disabledText: { fontSize: 15, color: '#999' },
  hint: { fontSize: 12, color: '#AAA', marginTop: 6 },

  footer: {
    padding: 20, paddingBottom: Platform.OS === 'android' ? 34 : 20,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE',
  },
  saveBtn: {
    backgroundColor: colors.dark1, borderRadius: 14, height: 54,
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
