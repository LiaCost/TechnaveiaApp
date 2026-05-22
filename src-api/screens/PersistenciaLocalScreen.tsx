import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, FlatList, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { ufService } from '../services/ufService';
import { cidadeService } from '../services/cidadeService';
import { db } from '../database/db'; // Importando a conexão limpa

// Tipagens locais baseadas no PDF
type UF = { id: number; nome: string; sigla: string };
type Cidade = { id: number; nome: string; uf_id: number; uf_sigla?: string };

export default function PersistenciaLocalScreen() {
  const [ready, setReady] = useState(false);
  const [aba, setAba] = useState<'uf' | 'cidade'>('uf');
  
  // Estados dos formulários
  const [nomeUF, setNomeUF] = useState('');
  const [siglaUF, setSiglaUF] = useState('');
  const [nomeCidade, setNomeCidade] = useState('');
  const [ufSelecionadaId, setUfSelecionadaId] = useState<number | null>(null);

  // Estados das listas
  const [ufs, setUfs] = useState<UF[]>([]);
  const [cidades, setCidades] = useState<any[]>([]);

  // Função para recarregar os dados (Drizzle)
  const recarregar = useCallback(async () => {
    try {
      const [listaUF, listaCidade] = await Promise.all([
        ufService.listar(),
        cidadeService.listarComUf()
      ]);
      setUfs(listaUF);
      setCidades(listaCidade);
    } catch (e: any) {
      Alert.alert('Erro ao carregar dados', e.message);
    }
  }, []);

  // Inicialização forçando a criação das tabelas se não existirem
  useEffect(() => {
    async function iniciarBancoLocal() {
      try {
        // Habilita chaves estrangeiras no SQLite local (essencial para o Cascade)
        await db.run('PRAGMA foreign_keys = ON;');

        // Cria a tabela de UFs se ela não existir
        await db.run(
          `CREATE TABLE IF NOT EXISTS ufs (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            nome TEXT NOT NULL, 
            sigla TEXT NOT NULL UNIQUE
          );`
        );

        // Cria a tabela de Cidades se ela não existir
        await db.run(
          `CREATE TABLE IF NOT EXISTS cidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            nome TEXT NOT NULL, 
            uf_id INTEGER NOT NULL REFERENCES ufs(id) ON DELETE CASCADE
          );`
        );
        
        // Busca os dados após garantir as tabelas
        await recarregar();
        setReady(true);
      } catch (err: any) {
        Alert.alert('Erro ao inicializar tabelas', String(err));
      }
    }

    iniciarBancoLocal();
  }, [recarregar]);

  // Lógica de Salvar UF (Drizzle)
  const handleSalvarUF = async () => {
    if (!nomeUF.trim() || !siglaUF.trim()) {
      return Alert.alert('Atenção', 'Nome/Sigla obrigatórios');
    }
    try {
      await ufService.inserir(nomeUF.trim(), siglaUF.trim());
      setNomeUF(''); 
      setSiglaUF('');
      await recarregar();
    } catch (e: any) {
      Alert.alert('Erro', e.message.includes('UNIQUE') ? 'Sigla já cadastrada.' : String(e));
    }
  };

  // Lógica de Deletar UF (Drizzle)
  const handleDeletarUF = (uf: UF) => {
    Alert.alert('Confirmar', `Deletar "${uf.nome}"? As cidades vinculadas também serão removidas.`, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Deletar', 
        style: 'destructive', 
        onPress: async () => { 
          try {
            await ufService.deletar(uf.id); 
            await recarregar(); 
          } catch (e: any) {
            Alert.alert('Erro ao deletar', e.message);
          }
        } 
      },
    ]);
  };

  // Lógica de Salvar Cidade (Drizzle)
  const handleSalvarCidade = async () => {
    if (!nomeCidade.trim()) return Alert.alert('Atenção', 'Nome da cidade obrigatório');
    if (!ufSelecionadaId) return Alert.alert('Atenção', 'Selecione uma UF');
    
    try {
      await cidadeService.inserir(nomeCidade.trim(), ufSelecionadaId);
      setNomeCidade('');
      await recarregar();
    } catch (e: any) {
      Alert.alert('Erro', String(e));
    }
  };

  // Lógica de Deletar Cidade (Drizzle)
  const handleDeletarCidade = (cidade: any) => {
    Alert.alert('Confirmar', `Deletar "${cidade.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Deletar', 
        style: 'destructive', 
        onPress: async () => { 
          try {
            await cidadeService.deletar(cidade.id); 
            await recarregar(); 
          } catch (e: any) {
            Alert.alert('Erro ao deletar', e.message);
          }
        } 
      },
    ]);
  };

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={{ marginTop: 8 }}>Configurando e conectando ao banco local...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Cabeçalho de Abas idêntico ao PDF */}
          <View style={s.rowTabs}>
            <TouchableOpacity onPress={() => setAba('uf')} style={s.tabWrapper}>
              <Text style={[s.tab, aba === 'uf' && s.tabActive]}>UFs ({ufs.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAba('cidade')} style={s.tabWrapper}>
              <Text style={[s.tab, aba === 'cidade' && s.tabActive]}>Cidades ({cidades.length})</Text>
            </TouchableOpacity>
          </View>

          {/* ABA UF */}
          {aba === 'uf' && (
            <View style={s.content}>
              <TextInput style={s.input} placeholder="Nome da UF" value={nomeUF} onChangeText={setNomeUF} />
              <TextInput 
                style={s.input} 
                placeholder="Sigla" 
                value={siglaUF} 
                onChangeText={setSiglaUF} 
                maxLength={2}
                autoCapitalize="characters" 
              />
              <TouchableOpacity style={s.btn} onPress={handleSalvarUF}>
                <Text style={s.btnText}>Salvar</Text>
              </TouchableOpacity>
              
              <FlatList
                data={ufs}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <View style={s.listItem}>
                    <Text style={s.itemText}>{item.sigla} - {item.nome}</Text>
                    <TouchableOpacity onPress={() => handleDeletarUF(item)}>
                      <Text style={s.del}>Deletar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={<Text style={s.empty}>Lista de UFs vazia!</Text>}
              />
            </View>
          )}

          {/* ABA CIDADE */}
          {aba === 'cidade' && (
            <View style={s.content}>
              <TextInput style={s.input} placeholder="Nome da cidade" value={nomeCidade} onChangeText={setNomeCidade} />
              
              <Text style={s.label}>Selecione a UF:</Text>
              <View style={s.chipRow}>
                {ufs.map((uf) => (
                  <TouchableOpacity 
                    key={uf.id} 
                    onPress={() => setUfSelecionadaId(uf.id)}
                    style={[s.chip, ufSelecionadaId === uf.id && s.chipActive]}
                  >
                    <Text style={[s.chipText, ufSelecionadaId === uf.id && s.chipTextActive]}>{uf.sigla}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={s.btn} onPress={handleSalvarCidade}>
                <Text style={s.btnText}>Salvar Cidade</Text>
              </TouchableOpacity>
              
              <FlatList
                data={cidades}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <View style={s.listItem}>
                    <Text style={s.itemText}>[{item.uf_sigla}] {item.nome}</Text>
                    <TouchableOpacity onPress={() => handleDeletarCidade(item)}>
                      <Text style={s.del}>Deletar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={<Text style={s.empty}>Nenhuma cidade cadastrada.</Text>}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 16 },
  rowTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  tabWrapper: { flex: 1, alignItems: 'center' },
  tab: { padding: 14, color: '#999', fontSize: 16 },
  tabActive: { color: '#000', fontWeight: '700', borderBottomWidth: 3, borderBottomColor: '#000' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  btn: { backgroundColor: '#000', borderRadius: 6, padding: 14, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#000', borderColor: '#000' },
  chipText: { color: '#333', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 16, color: '#222' },
  del: { color: '#c00', fontWeight: '600' },
  empty: { color: '#999', textAlign: 'center', marginTop: 24, fontSize: 14 }
});