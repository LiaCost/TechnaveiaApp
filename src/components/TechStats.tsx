import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface Props {
  pedidosHoje?: number;
  ganhosSemana?: number;
  avaliacao?: number;
  taxaAceitacao?: number;
  isLoading?: boolean;
}

export function TechStats({
  pedidosHoje    = 0,
  ganhosSemana   = 0,
  avaliacao      = 0,
  taxaAceitacao  = 0,
  isLoading      = false,
}: Props) {
  const cards = [
    {
      value: isLoading ? '–' : pedidosHoje.toString().padStart(2, '0'),
      label: 'Pedidos Hoje',
      highlight: false,
    },
    {
      value: isLoading ? '–' : `R$ ${ganhosSemana.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
      label: 'Ganhos Semana',
      highlight: true,
    },
    {
      value: isLoading ? '–' : avaliacao.toFixed(1),
      label: 'Avaliação',
      highlight: false,
    },
    {
      value: isLoading ? '–' : `${taxaAceitacao}%`,
      label: 'Aceitação',
      highlight: false,
    },
  ];

  return (
    <View style={s.container}>
      {cards.map((card, i) => (
        <View
          key={i}
          style={[s.card, card.highlight && { backgroundColor: colors.primary }]}
        >
          <Text style={[s.value, card.highlight && { color: '#FFF' }]}>
            {card.value}
          </Text>
          <Text style={[s.label, card.highlight && { color: '#EEE' }]}>
            {card.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 20,
  },
  card: {
    width: '47%',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});