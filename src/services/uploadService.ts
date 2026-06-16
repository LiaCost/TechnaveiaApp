/**
 * Serviço de upload de imagens via multipart/form-data.
 *
 * Funciona com qualquer URI local (expo-image-picker, câmera, etc.)
 * e envia para o backend, retornando a URL pública.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
const UPLOAD_TIMEOUT = 30_000; // 30 segundos (uploads podem ser lentos)

interface UploadResult {
  url: string;
  filename: string;
}

/**
 * Faz upload de uma imagem local para o backend.
 *
 * @param uri - URI local da imagem (ex: file:///...)
 * @param fieldName - Nome do campo no FormData (default: 'file')
 * @param endpoint - Endpoint de upload (default: '/uploads/image')
 */
export async function uploadImage(
  uri: string,
  fieldName = 'file',
  endpoint = '/uploads/image'
): Promise<UploadResult> {
  const token = await AsyncStorage.getItem('@technaveia:token');

  // Extrair extensão e tipo MIME
  const filename = uri.split('/').pop() ?? 'photo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';

  // Montar FormData
  const formData = new FormData();
  formData.append(fieldName, {
    uri,
    name: filename,
    type: mimeType,
  } as any);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // NÃO definir Content-Type — o fetch define automaticamente com boundary para FormData
      },
      body: formData,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, err.message ?? `Erro no upload: ${res.status}`, err);
    }

    const json = await res.json();
    const data = json.data ?? json;

    return {
      url: data.url ?? data.uri ?? '',
      filename: data.filename ?? filename,
    };
  } catch (error) {
    clearTimeout(timeout);
    if ((error as Error).name === 'AbortError') {
      throw new ApiError(408, 'Upload excedeu o tempo limite. Tente com uma imagem menor.');
    }
    throw error;
  }
}

/**
 * Upload múltiplo de imagens em paralelo.
 *
 * @param uris - Array de URIs locais
 * @param fieldName - Nome do campo (default: 'file')
 * @param endpoint - Endpoint de upload
 */
export async function uploadMultipleImages(
  uris: string[],
  fieldName = 'file',
  endpoint = '/uploads/image'
): Promise<UploadResult[]> {
  return Promise.all(uris.map(uri => uploadImage(uri, fieldName, endpoint)));
}
