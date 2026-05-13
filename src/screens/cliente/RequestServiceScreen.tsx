import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, Image, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../../theme';
import { Button } from '../../components/Button';
import { ImageSelector } from '../../components/ImageSelector'; // Reutilizando o que criamos
import { Calendar, LocaleConfig } from 'react-native-calendars';

export function RequestServiceScreen({ navigation }: any) { 
    const [isConfirmed, setIsConfirmed] = useState(false);
    // Configuração do calendário para Português
    LocaleConfig.locales['pt-br'] = {
    monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
    dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
    today: 'Hoje'
    };
    LocaleConfig.defaultLocale = 'pt-br';

    // Dentro do componente:
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedHour, setSelectedHour] = useState('');

    const hours = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'];

  // Antigo
  const [step, setStep] = useState(1);
  
  // Estados do Pedido
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [modalidade, setModalidade] = useState<'presencial' | 'remoto'>('presencial');

  const nextStep = () => {
    if (step === 1 && description.length < 20) {
      Alert.alert("Detalhe melhor", "Por favor, descreva o problema com pelo menos 20 caracteres.");
      return;
    }
    setStep(step + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com Progresso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / 6) * 100}%` }]} />
        </View>
        <Text style={styles.stepCount}>{step}/6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* PASSO 1: DESCRIÇÃO DO PROBLEMA */}
        {step === 1 && (
          <View>
            <Text style={styles.title}>O que está acontecendo?</Text>
            <Text style={styles.subtitle}>Descreva o defeito detalhadamente para o técnico se preparar.</Text>
            
            <TextInput
              style={styles.textArea}
              placeholder="Ex: Meu notebook liga, mas a tela fica preta e faz um bipe..."
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
            
            <Text style={styles.label}>Fotos do problema (Opcional)</Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <ImageSelector 
                label="Adicionar Foto" 
                onImageSelected={(uri) => setImages([...images, uri])} 
              />
            </View>
          </View>
        )}

        {/* PASSO 2: MODALIDADE E LOCAL */}
        {step === 2 && (
          <View>
            <Text style={styles.title}>Onde será o atendimento?</Text>
            
            <View style={styles.modeContainer}>
              <TouchableOpacity 
                style={[styles.modeCard, modalidade === 'presencial' && styles.modeSelected]}
                onPress={() => setModalidade('presencial')}
              >
                <Ionicons name="home-outline" size={32} color={modalidade === 'presencial' ? colors.primary : '#666'} />
                <Text style={[styles.modeText, modalidade === 'presencial' && {color: colors.primary}]}>Presencial</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modeCard, modalidade === 'remoto' && styles.modeSelected]}
                onPress={() => setModalidade('remoto')}
              >
                <Ionicons name="laptop-outline" size={32} color={modalidade === 'remoto' ? colors.primary : '#666'} />
                <Text style={[styles.modeText, modalidade === 'remoto' && {color: colors.primary}]}>Remoto</Text>
              </TouchableOpacity>
            </View>

            {modalidade === 'presencial' ? (
              <View style={styles.addressBox}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={{fontWeight: 'bold'}}>Endereço Cadastrado</Text>
                  <Text style={{color: '#666'}}>Av. Paulista, 1000 - São Paulo, SP</Text>
                </View>
                <TouchableOpacity><Text style={{color: colors.primary}}>Alterar</Text></TouchableOpacity>
              </View>
            ) : (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.infoText}>
                  O técnico entrará em contato para solicitar o acesso via AnyDesk ou TeamViewer.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* PASSO 3: DATA E HORÁRIO */}
        {step === 3 && (
        <View>
            <Text style={styles.title}>Quando prefere?</Text>
            
            <Calendar
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={{
                [selectedDate]: { selected: true, selectedColor: colors.primary }
            }}
            theme={{
                todayTextColor: colors.primary,
                arrowColor: colors.primary,
            }}
            style={styles.calendar}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>Horários Disponíveis</Text>
            <View style={styles.hoursGrid}>
            {hours.map(hour => (
                <TouchableOpacity 
                key={hour} 
                style={[styles.hourChip, selectedHour === hour && styles.hourSelected]}
                onPress={() => setSelectedHour(hour)}
                >
                <Text style={{ color: selectedHour === hour ? '#FFF' : '#666' }}>{hour}</Text>
                </TouchableOpacity>
            ))}
            </View>
            
            <TouchableOpacity style={styles.urgenteBtn}>
            <Ionicons name="flash" size={20} color="#FF9500" />
            <Text style={styles.urgenteText}>Preciso de urgência (Primeiro disponível)</Text>
            </TouchableOpacity>
        </View>
        )}

        {/* PASSO 4: ESCOLHER TÉCNICO */}
        {step === 4 && (
        <View>
            <Text style={styles.title}>Escolha o Profissional</Text>
            <Text style={styles.subtitle}>Estes técnicos atendem no horário selecionado.</Text>

            <TouchableOpacity style={styles.anyTechCard} onPress={nextStep}>
            <View style={styles.anyTechIcon}>
                <Ionicons name="people" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: 'bold' }}>Qualquer técnico disponível</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Agiliza a aceitação do seu pedido</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            {/* Lista de Técnicos Específicos */}
            {[1, 2].map(i => (
            <TouchableOpacity key={i} style={styles.techSelectionCard} onPress={nextStep}>
                <View style={styles.avatarMini} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: 'bold' }}>Ricardo Silva</Text>
                <Text style={{ fontSize: 12, color: colors.primary }}>Est. R$ 120,00 - 150,00</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={{ fontSize: 12, color: '#666' }}> 4.9 (128)</Text>
                </View>
                </View>
                <Ionicons name="radio-button-off" size={24} color="#CCC" />
            </TouchableOpacity>
            ))}
        </View>
        )}

        {/* PASSO 5: REVISÃO E CONFIRMAÇÃO */}
        {step === 5 && (
        <View>
            <Text style={styles.title}>Revise seu Pedido</Text>
            <Text style={styles.subtitle}>Confira os detalhes antes de enviar para os técnicos.</Text>

            <View style={styles.reviewCard}>
            <View style={styles.reviewRow}>
                <Ionicons name="construct-outline" size={20} color={colors.primary} />
                <Text style={styles.reviewText}>Problema: <Text style={{fontWeight: 'bold'}}>{description.substring(0, 30)}...</Text></Text>
            </View>
            
            <View style={styles.reviewRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.reviewText}>Data: <Text style={{fontWeight: 'bold'}}>{selectedDate} às {selectedHour}</Text></Text>
            </View>

            <View style={styles.reviewRow}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <Text style={styles.reviewText}>Modalidade: <Text style={{fontWeight: 'bold'}}>{modalidade === 'presencial' ? 'Presencial' : 'Remoto'}</Text></Text>
            </View>
            </View>

            <View style={styles.priceEstimate}>
            <Text style={styles.priceLabel}>Estimativa de Preço</Text>
            <Text style={styles.priceValue}>R$ 120,00 - R$ 180,00*</Text>
            <Text style={styles.priceNote}>*O valor final será definido após o orçamento do técnico.</Text>
            </View>

            <View style={styles.termsRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
            <Text style={styles.termsText}>Sua segurança é nossa prioridade. O pagamento só é liberado após sua aprovação final.</Text>
            </View>

            <Button 
            title="Confirmar Solicitação" 
            onPress={() => setStep(6)} 
            />
        </View>
        )}

        {/* PASSO 6: AGUARDANDO RESPOSTA (TELA DE SUCESSO) */}
        {step === 6 && (
        <View style={styles.successContainer}>
            <View style={styles.loadingCircle}>
            {/* Aqui você pode usar uma LottieView para uma animação profissional */}
            <Ionicons name="paper-plane" size={50} color={colors.primary} />
            </View>
            
            <Text style={styles.successTitle}>Buscando o melhor técnico...</Text>
            <Text style={styles.successSub}>
            Sua solicitação foi enviada! Você receberá uma notificação assim que um técnico aceitar ou enviar um orçamento.
            </Text>

            <View style={styles.timerBox}>
            <Text style={styles.timerLabel}>Tempo médio de resposta</Text>
            <Text style={styles.timerValue}>15 - 30 min</Text>
            </View>

            <TouchableOpacity 
            style={styles.btnSecondary}
            onPress={() => navigation.replace('MainTabs')}
            >
            <Text style={styles.btnSecondaryText}>Ir para Meus Pedidos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20 }}>
            <Text style={{ color: colors.danger }}>Cancelar Solicitação</Text>
            </TouchableOpacity>
        </View>
        )}

        {/* O botão "Próximo" é fixo para todos os steps */}
        <View style={{ marginTop: 30 }}>
          <Button title="Próximo" onPress={nextStep} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
  progressContainer: { flex: 1, height: 8, backgroundColor: '#EEE', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: colors.primary },
  stepCount: { fontWeight: 'bold', color: '#666' },
  scroll: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#666', marginBottom: 20, lineHeight: 20 },
  textArea: { backgroundColor: '#F8F9FF', borderRadius: 15, padding: 15, height: 150, borderWidth: 1, borderColor: '#E8EEFF', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  modeContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  modeCard: { flex: 1, height: 120, backgroundColor: '#F8F9FF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  modeSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '05' },
  modeText: { marginTop: 10, fontWeight: 'bold', color: '#666' },
  addressBox: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#F8F9FF', borderRadius: 15 },
  infoBox: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: colors.primary + '10', borderRadius: 15, gap: 10 },
  infoText: { flex: 1, color: colors.primary, fontSize: 14 },
  calendar: { borderRadius: 15, padding: 10, elevation: 2, backgroundColor: '#FFF' },
  hoursGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  hourChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F0F2F5', minWidth: '30%', alignItems: 'center' },
  hourSelected: { backgroundColor: colors.primary },
  urgenteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#FF9500', borderStyle: 'dashed' },
  urgenteText: { marginLeft: 10, color: '#FF9500', fontWeight: 'bold' },
  anyTechCard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: colors.primary + '10', borderRadius: 15, marginBottom: 15 },
  anyTechIcon: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  techSelectionCard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#F8F9FF', borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#E8EEFF' },
  avatarMini: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#DDD' },
  reviewCard: { backgroundColor: '#F8F9FF', borderRadius: 20, padding: 20, marginBottom: 20 },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  reviewText: { fontSize: 15, color: '#444' },
  priceEstimate: { alignItems: 'center', marginBottom: 25, padding: 15, borderTopWidth: 1, borderColor: '#EEE' },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValue: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginVertical: 5 },
  priceNote: { fontSize: 11, color: '#999', textAlign: 'center' },
  termsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 10, marginBottom: 30 },
  termsText: { flex: 1, fontSize: 12, color: '#666', lineHeight: 18 },
  // Step 6 Success
  successContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 50 },
  loadingCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  successTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  successSub: { textAlign: 'center', color: '#666', lineHeight: 22, marginBottom: 40 },
  timerBox: { backgroundColor: '#F0F2F5', padding: 20, borderRadius: 15, width: '100%', alignItems: 'center', marginBottom: 30 },
  timerLabel: { fontSize: 12, color: '#666' },
  timerValue: { fontSize: 20, fontWeight: 'bold', color: colors.dark1 },
  btnSecondary: { width: '100%', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  btnSecondaryText: { color: colors.primary, fontWeight: 'bold' }
});