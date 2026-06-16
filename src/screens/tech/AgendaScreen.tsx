import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert, Modal, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { orderService, Order } from '../../services/api';

// ─── Tipos ────────────────────────────────────────────────

type ViewMode = 'day' | 'week' | 'month';
type AppointmentStatus = 'confirmado' | 'andamento' | 'concluido' | 'cancelado';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  duration: number; // minutos
  status: AppointmentStatus;
  address: string;
  modalidade: 'presencial' | 'remoto';
}

interface WorkHours {
  enabled: boolean;
  start: string;
  end: string;
}

interface WorkSchedule {
  [key: string]: WorkHours;
}

// ─── Dados mock ───────────────────────────────────────────

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  confirmado: { label: 'Confirmado', color: '#1976D2', bg: '#E3F2FD', icon: 'checkmark-circle-outline' },
  andamento:  { label: 'Em andamento', color: '#2E7D32', bg: '#E8F5E9', icon: 'play-circle-outline' },
  concluido:  { label: 'Concluído', color: '#666', bg: '#F5F5F5', icon: 'checkmark-done-circle-outline' },
  cancelado:  { label: 'Cancelado', color: '#C62828', bg: '#FFEBEE', icon: 'close-circle-outline' },
};

const MOCK_APPOINTMENTS: Record<string, Appointment[]> = {};

// Preenche agenda dos próximos 14 dias com dados mock
(() => {
  const appts: Appointment[][] = [
    [
      { id: 'a1', clientName: 'João Pedro', service: 'Formatação de PC', time: '09:00', duration: 90, status: 'confirmado', address: 'Av. Paulista, 1000', modalidade: 'presencial' },
      { id: 'a2', clientName: 'Carla Mendes', service: 'Configuração de Roteador', time: '14:00', duration: 60, status: 'concluido', address: 'R. Augusta, 500', modalidade: 'presencial' },
    ],
    [
      { id: 'a3', clientName: 'Roberto Alves', service: 'Suporte Remoto', time: '10:00', duration: 45, status: 'confirmado', address: 'Remoto', modalidade: 'remoto' },
    ],
    [],
    [
      { id: 'a4', clientName: 'Ana Lima', service: 'Troca de Tela Notebook', time: '09:30', duration: 120, status: 'confirmado', address: 'R. da Consolação, 200', modalidade: 'presencial' },
      { id: 'a5', clientName: 'Marcos Souza', service: 'Instalação de Câmeras', time: '15:00', duration: 180, status: 'confirmado', address: 'Al. Santos, 800', modalidade: 'presencial' },
    ],
    [],
    [
      { id: 'a6', clientName: 'Fernanda Costa', service: 'Limpeza de Notebook', time: '11:00', duration: 60, status: 'confirmado', address: 'R. Bela Cintra, 100', modalidade: 'presencial' },
    ],
    [],
  ];

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    MOCK_APPOINTMENTS[key] = appts[i % appts.length] ?? [];
  }
})();

const DEFAULT_SCHEDULE: WorkSchedule = {
  Domingo:  { enabled: false, start: '08:00', end: '18:00' },
  Segunda:  { enabled: true,  start: '08:00', end: '18:00' },
  Terça:    { enabled: true,  start: '08:00', end: '18:00' },
  Quarta:   { enabled: true,  start: '08:00', end: '18:00' },
  Quinta:   { enabled: true,  start: '08:00', end: '18:00' },
  Sexta:    { enabled: true,  start: '08:00', end: '17:00' },
  Sábado:   { enabled: true,  start: '09:00', end: '14:00' },
};

// ─── Utilitários ──────────────────────────────────────────

function getWeekDates(anchor: Date): Date[] {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function getMonthDates(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month, d));
  }
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function dateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// ─── Subcomponentes ───────────────────────────────────────

function AppointmentCard({ appt, onPress }: { appt: Appointment; onPress: () => void }) {
  const cfg = STATUS_CONFIG[appt.status];
  return (
    <TouchableOpacity style={[ac.card, { borderLeftColor: cfg.color }]} onPress={onPress}>
      <View style={ac.row}>
        <View>
          <Text style={ac.time}>{appt.time}</Text>
          <Text style={ac.duration}>{appt.duration} min</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={ac.service}>{appt.service}</Text>
          <Text style={ac.client}>{appt.clientName}</Text>
          <View style={ac.meta}>
            <Ionicons
              name={appt.modalidade === 'presencial' ? 'location-outline' : 'laptop-outline'}
              size={13} color="#999"
            />
            <Text style={ac.metaText}>{appt.address}</Text>
          </View>
        </View>
        <View style={[ac.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[ac.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const ac = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 14,
    marginBottom: 10, borderLeftWidth: 4,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  time: { fontSize: 15, fontWeight: '700', color: colors.dark1 },
  duration: { fontSize: 11, color: '#AAA', marginTop: 2 },
  service: { fontSize: 14, fontWeight: '700', color: '#222' },
  client: { fontSize: 13, color: '#666', marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 12, color: '#999' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '700' },
});

// ─── Tela principal ────────────────────────────────────────

export function AgendaScreen({ navigation }: any) {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthAnchor, setMonthAnchor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [schedule, setSchedule] = useState<WorkSchedule>(DEFAULT_SCHEDULE);
  const insets = useSafeAreaInsets();
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [allAppointments, setAllAppointments] = useState<Record<string, Appointment[]>>({});
  const [loading, setLoading] = useState(true);

  // Carrega pedidos aceitos/andamento da API e mapeia para Appointments
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      orderService.list()
        .then(orders => {
          const mapped: Record<string, Appointment[]> = {};
          orders.forEach(order => {
            if (!['aceito', 'andamento', 'concluido'].includes(order.status)) return;
            const key = order.dataAgendada
              ? (() => {
                  // dataAgendada vem como "DD/MM/YYYY" após normalizeOrder
                  const parts = order.dataAgendada.split('/');
                  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                  return dateKey(new Date());
                })()
              : dateKey(new Date());
            const statusMap: Record<string, AppointmentStatus> = {
              aceito: 'confirmado', andamento: 'andamento', concluido: 'concluido',
            };
            const appt: Appointment = {
              id: order.id,
              clientName: order.cliente?.nome ?? 'Cliente',
              service: `${order.categoria} - ${order.subcategoria}`,
              time: order.horaAgendada ?? '09:00',
              duration: 60,
              status: statusMap[order.status] ?? 'confirmado',
              address: order.endereco ?? (order.modalidade === 'remoto' ? 'Remoto' : 'A definir'),
              modalidade: order.modalidade,
            };
            if (!mapped[key]) mapped[key] = [];
            mapped[key].push(appt);
          });
          setAllAppointments(mapped);
        })
        .catch(() => setAllAppointments({}))
        .finally(() => setLoading(false));
    }, [])
  );

  const selectedKey = dateKey(selectedDate);
  const appointments = allAppointments[selectedKey] ?? [];

  const weekDates = getWeekDates(selectedDate);
  const monthGrid = getMonthDates(monthAnchor.year, monthAnchor.month);

  function apptCount(d: Date) {
    return allAppointments[dateKey(d)]?.length ?? 0;
  }

  function toggleDay(dayName: string) {
    setSchedule(prev => ({
      ...prev,
      [dayName]: { ...prev[dayName], enabled: !prev[dayName].enabled },
    }));
  }

  function handleApptAction(action: 'confirm' | 'reschedule' | 'cancel') {
    const labels = { confirm: 'confirmado', reschedule: 'remarcado', cancel: 'cancelado' };
    Alert.alert('Agendamento', `Serviço ${labels[action]} com sucesso!`);
    setSelectedAppt(null);
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Agenda</Text>
          <Text style={s.headerSub}>
            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </Text>
        </View>
        <TouchableOpacity style={s.availBtn} onPress={() => setShowAvailability(true)}>
          <Ionicons name="settings-outline" size={18} color={colors.primary} />
          <Text style={s.availBtnText}>Disponibilidade</Text>
        </TouchableOpacity>
      </View>

      {/* ── Toggle de visualização ── */}
      <View style={s.viewToggle}>
        {(['day', 'week', 'month'] as ViewMode[]).map(v => (
          <TouchableOpacity
            key={v}
            style={[s.viewBtn, viewMode === v && s.viewBtnActive]}
            onPress={() => setViewMode(v)}
          >
            <Text style={[s.viewBtnText, viewMode === v && s.viewBtnTextActive]}>
              {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>

        {/* ── Visão Dia ── */}
        {viewMode === 'day' && (
          <View style={s.section}>
            {/* Mini calendário horizontal */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {Array.from({ length: 14 }, (_, i) => {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                const isSelected = sameDay(d, selectedDate);
                const count = apptCount(d);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[s.miniDay, isSelected && s.miniDayActive]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Text style={[s.miniDayName, isSelected && { color: '#FFF' }]}>
                      {DAYS_PT[d.getDay()]}
                    </Text>
                    <Text style={[s.miniDayNum, isSelected && { color: '#FFF' }]}>
                      {d.getDate()}
                    </Text>
                    {count > 0 && (
                      <View style={[s.dotBadge, isSelected && { backgroundColor: '#FFF' }]}>
                        <Text style={[s.dotBadgeText, isSelected && { color: colors.primary }]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {appointments.length === 0 ? (
              <View style={s.emptyDay}>
                <Ionicons name="calendar-outline" size={44} color="#DDD" />
                <Text style={s.emptyText}>Nenhum agendamento para este dia</Text>
                <Text style={s.emptySub}>Aproveite para descansar ou aceitar novas solicitações!</Text>
              </View>
            ) : (
              appointments.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} onPress={() => setSelectedAppt(appt)} />
              ))
            )}
          </View>
        )}

        {/* ── Visão Semana ── */}
        {viewMode === 'week' && (
          <View style={s.section}>
            <View style={s.weekRow}>
              {weekDates.map((d, i) => {
                const isSelected = sameDay(d, selectedDate);
                const isToday = sameDay(d, today);
                const count = apptCount(d);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[s.weekDay, isSelected && s.weekDayActive]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Text style={[s.weekDayName, isSelected && { color: '#FFF' }]}>
                      {DAYS_PT[d.getDay()]}
                    </Text>
                    <View style={[s.weekDayNum, isToday && !isSelected && s.weekDayNumToday]}>
                      <Text style={[s.weekDayNumText, isSelected && { color: '#FFF' }, isToday && !isSelected && { color: colors.primary }]}>
                        {d.getDate()}
                      </Text>
                    </View>
                    {count > 0 && (
                      <View style={[s.weekDot, isSelected && { backgroundColor: '#FFF' }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.weekSelectedTitle}>
              {sameDay(selectedDate, today) ? 'Hoje' : DAYS_FULL[selectedDate.getDay()]}
              {appointments.length > 0 ? ` — ${appointments.length} agendamento${appointments.length > 1 ? 's' : ''}` : ''}
            </Text>

            {appointments.length === 0 ? (
              <View style={s.emptyDay}>
                <Ionicons name="calendar-outline" size={44} color="#DDD" />
                <Text style={s.emptyText}>Dia livre</Text>
                <Text style={s.emptySub}>Sem agendamentos para este dia</Text>
              </View>
            ) : (
              appointments.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} onPress={() => setSelectedAppt(appt)} />
              ))
            )}
          </View>
        )}

        {/* ── Visão Mês ── */}
        {viewMode === 'month' && (
          <View style={s.section}>
            {/* Navegação de mês */}
            <View style={s.monthNav}>
              <TouchableOpacity onPress={() => {
                const prev = new Date(monthAnchor.year, monthAnchor.month - 1);
                setMonthAnchor({ year: prev.getFullYear(), month: prev.getMonth() });
              }}>
                <Ionicons name="chevron-back" size={24} color={colors.dark1} />
              </TouchableOpacity>
              <Text style={s.monthTitle}>
                {MONTHS_PT[monthAnchor.month]} {monthAnchor.year}
              </Text>
              <TouchableOpacity onPress={() => {
                const next = new Date(monthAnchor.year, monthAnchor.month + 1);
                setMonthAnchor({ year: next.getFullYear(), month: next.getMonth() });
              }}>
                <Ionicons name="chevron-forward" size={24} color={colors.dark1} />
              </TouchableOpacity>
            </View>

            {/* Cabeçalhos */}
            <View style={s.monthGrid}>
              {DAYS_PT.map(d => (
                <Text key={d} style={s.monthDayHeader}>{d}</Text>
              ))}
            </View>

            {/* Dias */}
            <View style={s.monthGrid}>
              {monthGrid.map((d, i) => {
                if (!d) return <View key={i} style={s.monthCell} />;
                const isSelected = sameDay(d, selectedDate);
                const isToday = sameDay(d, today);
                const count = apptCount(d);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[s.monthCell, isSelected && s.monthCellActive, isToday && !isSelected && s.monthCellToday]}
                    onPress={() => { setSelectedDate(d); setViewMode('day'); }}
                  >
                    <Text style={[
                      s.monthCellText,
                      isSelected && { color: '#FFF' },
                      isToday && !isSelected && { color: colors.primary, fontWeight: '700' },
                    ]}>
                      {d.getDate()}
                    </Text>
                    {count > 0 && (
                      <View style={[s.monthDot, isSelected && { backgroundColor: '#FFF' }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legenda */}
            <View style={s.legend}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <View key={key} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: cfg.color }]} />
                  <Text style={s.legendText}>{cfg.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* ══ Modal: Detalhe do agendamento ══ */}
      <Modal visible={!!selectedAppt} transparent animationType="slide" onRequestClose={() => setSelectedAppt(null)}>
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.handle} />
            {selectedAppt && (() => {
              const cfg = STATUS_CONFIG[selectedAppt.status];
              return (
                <>
                  <View style={m.header}>
                    <View style={[m.statusPill, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon} size={14} color={cfg.color} />
                      <Text style={[m.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedAppt(null)}>
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <Text style={m.service}>{selectedAppt.service}</Text>
                  <Text style={m.client}>{selectedAppt.clientName}</Text>

                  <View style={m.infoGrid}>
                    <View style={m.infoItem}>
                      <Ionicons name="time-outline" size={18} color={colors.primary} />
                      <View>
                        <Text style={m.infoLabel}>Horário</Text>
                        <Text style={m.infoVal}>{selectedAppt.time} · {selectedAppt.duration} min</Text>
                      </View>
                    </View>
                    <View style={m.infoItem}>
                      <Ionicons name="location-outline" size={18} color={colors.primary} />
                      <View>
                        <Text style={m.infoLabel}>Local</Text>
                        <Text style={m.infoVal}>{selectedAppt.address}</Text>
                      </View>
                    </View>
                  </View>

                  {selectedAppt.status === 'confirmado' && (
                    <View style={m.actions}>
                      <TouchableOpacity
                        style={[m.btn, { backgroundColor: '#E8F5E9', flex: 1 }]}
                        onPress={() => { setSelectedAppt(null); const parent = navigation.getParent(); (parent ?? navigation).navigate('ServiceExecution', { orderId: selectedAppt.id }); }}
                      >
                        <Ionicons name="play-circle-outline" size={18} color="#2E7D32" />
                        <Text style={[m.btnText, { color: '#2E7D32' }]}>Iniciar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[m.btn, { backgroundColor: '#FFF3E0', flex: 1 }]}
                        onPress={() => handleApptAction('reschedule')}
                      >
                        <Ionicons name="calendar-outline" size={18} color="#E65100" />
                        <Text style={[m.btnText, { color: '#E65100' }]}>Remarcar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[m.btn, { backgroundColor: '#FFEBEE', flex: 1 }]}
                        onPress={() => handleApptAction('cancel')}
                      >
                        <Ionicons name="close-circle-outline" size={18} color="#C62828" />
                        <Text style={[m.btnText, { color: '#C62828' }]}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* ══ Modal: Disponibilidade ══ */}
      <Modal visible={showAvailability} transparent animationType="slide" onRequestClose={() => setShowAvailability(false)}>
        <View style={m.overlay}>
          <View style={[m.sheet, { maxHeight: '85%' }]}>
            <View style={m.handle} />
            <View style={[m.header, { marginBottom: 4 }]}>
              <Text style={m.service}>Horário de trabalho</Text>
              <TouchableOpacity onPress={() => setShowAvailability(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: '#888', marginBottom: 16, paddingHorizontal: 2 }}>
              Defina os dias e horários em que você aceita solicitações
            </Text>

            <ScrollView>
              {DAYS_FULL.map((day) => {
                const cfg = schedule[day];
                return (
                  <View key={day} style={av.dayRow}>
                    <Switch
                      value={cfg.enabled}
                      onValueChange={() => toggleDay(day)}
                      trackColor={{ true: colors.primary + '60' }}
                      thumbColor={cfg.enabled ? colors.primary : '#CCC'}
                    />
                    <Text style={[av.dayName, !cfg.enabled && { color: '#BBB' }]}>{day}</Text>
                    {cfg.enabled ? (
                      <View style={av.hours}>
                        <View style={av.timeBox}><Text style={av.timeText}>{cfg.start}</Text></View>
                        <Text style={av.timeSep}>–</Text>
                        <View style={av.timeBox}><Text style={av.timeText}>{cfg.end}</Text></View>
                      </View>
                    ) : (
                      <Text style={av.offText}>Folga</Text>
                    )}
                  </View>
                );
              })}

              <TouchableOpacity
                style={av.saveBtn}
                onPress={() => { Alert.alert('Salvo!', 'Sua disponibilidade foi atualizada.'); setShowAvailability(false); }}
              >
                <Text style={av.saveBtnText}>Salvar disponibilidade</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.dark1 },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2, textTransform: 'capitalize' },
  availBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary + '12', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  availBtnText: { color: colors.primary, fontWeight: '600', fontSize: 13 },

  viewToggle: {
    flexDirection: 'row', backgroundColor: '#FFF',
    paddingHorizontal: 20, paddingBottom: 12, gap: 8,
  },
  viewBtn: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F0F2F5',
  },
  viewBtnActive: { backgroundColor: colors.dark1 },
  viewBtnText: { fontSize: 13, fontWeight: '600', color: '#666' },
  viewBtnTextActive: { color: '#FFF' },

  section: { padding: 20 },

  // Dia
  miniDay: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 14, marginRight: 8, backgroundColor: '#FFF',
    minWidth: 56,
  },
  miniDayActive: { backgroundColor: colors.primary },
  miniDayName: { fontSize: 11, fontWeight: '600', color: '#888' },
  miniDayNum: { fontSize: 18, fontWeight: '700', color: colors.dark1, marginTop: 2 },
  dotBadge: {
    marginTop: 4, backgroundColor: colors.primary,
    width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center',
  },
  dotBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  emptyDay: { alignItems: 'center', paddingVertical: 50, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#999' },
  emptySub: { fontSize: 13, color: '#BBB', textAlign: 'center' },

  // Semana
  weekRow: {
    flexDirection: 'row', backgroundColor: '#FFF',
    borderRadius: 16, padding: 8, marginBottom: 20, gap: 2,
  },
  weekDay: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12 },
  weekDayActive: { backgroundColor: colors.primary },
  weekDayName: { fontSize: 10, fontWeight: '600', color: '#999' },
  weekDayNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  weekDayNumToday: { backgroundColor: colors.primary + '15' },
  weekDayNumText: { fontSize: 15, fontWeight: '700', color: colors.dark1 },
  weekDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 4 },
  weekSelectedTitle: { fontSize: 16, fontWeight: '700', color: colors.dark1, marginBottom: 16, textTransform: 'capitalize' },

  // Mês
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthTitle: { fontSize: 17, fontWeight: '700', color: colors.dark1 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthDayHeader: { width: '14.28%', textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#AAA', paddingVertical: 6 },
  monthCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 100 },
  monthCellActive: { backgroundColor: colors.primary },
  monthCellToday: { backgroundColor: colors.primary + '15' },
  monthCellText: { fontSize: 14, color: colors.dark1 },
  monthDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#EEE' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#666' },
});

// Modal
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingTop: 12,
  },
  handle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  service: { fontSize: 20, fontWeight: '700', color: colors.dark1, marginBottom: 4 },
  client: { fontSize: 15, color: '#666', marginBottom: 20 },
  infoGrid: { gap: 14, marginBottom: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoLabel: { fontSize: 11, color: '#AAA', fontWeight: '600', textTransform: 'uppercase' },
  infoVal: { fontSize: 14, color: '#333', fontWeight: '500', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 12 },
  btnText: { fontSize: 13, fontWeight: '700' },
});

// Disponibilidade
const av = StyleSheet.create({
  dayRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5', gap: 12,
  },
  dayName: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.dark1 },
  hours: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeBox: { backgroundColor: '#F0F2F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  timeText: { fontSize: 13, fontWeight: '600', color: '#444' },
  timeSep: { color: '#AAA', fontWeight: '600' },
  offText: { fontSize: 13, color: '#BBB', fontWeight: '500' },
  saveBtn: {
    backgroundColor: colors.dark1, borderRadius: 14, height: 52,
    justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 8,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});