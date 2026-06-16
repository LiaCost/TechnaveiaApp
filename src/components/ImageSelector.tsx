import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '.././theme';
import { uploadImage } from '../services/uploadService';

interface Props {
  label: string;
  onImageSelected: (uri: string) => void;
  /** Se true, faz upload automático e retorna a URL do servidor */
  autoUpload?: boolean;
}

export function ImageSelector({ label, onImageSelected, autoUpload = false }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para continuar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);

      if (autoUpload) {
        setUploading(true);
        try {
          const { url } = await uploadImage(uri);
          onImageSelected(url);
        } catch (error: any) {
          Alert.alert('Erro no upload', error.message ?? 'Não foi possível enviar a imagem.');
          onImageSelected(uri); // Fallback: retorna URI local
        } finally {
          setUploading(false);
        }
      } else {
        onImageSelected(uri);
      }
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={pickImage} disabled={uploading}>
      {image ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: image }} style={styles.preview} />
          {uploading && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.uploadText}>Enviando...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera-outline" size={30} color={colors.primary} />
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D9ED',
    borderStyle: 'dashed',
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#00000005',
  },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { marginTop: 8, fontSize: 14, color: '#666' },
  previewWrap: { flex: 1, width: '100%', height: '100%', position: 'relative' },
  preview: { flex: 1, width: '100%', height: '100%', resizeMode: 'cover' },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: { color: '#FFF', fontSize: 12, marginTop: 4 },
});