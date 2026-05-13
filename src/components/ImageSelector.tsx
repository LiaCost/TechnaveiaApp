import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '.././theme';

interface Props {
  label: string;
  onImageSelected: (uri: string) => void;
}

export function ImageSelector({ label, onImageSelected }: Props) {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // Pedir permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para continuar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7, // Reduz o tamanho para o upload ser mais rápido
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      onImageSelected(uri);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={pickImage}>
      {image ? (
        <Image source={{ uri: image }} style={styles.preview} />
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
  preview: { flex: 1, width: '100%', height: '100%', resizeMode: 'cover' }
});