import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function ChatListScreen() {
  const [activeTab, setActiveTab] = useState('Ativas');

  const chats = [
    { id: '1', name: 'Ricardo Silva (Técnico)', lastMsg: 'O orçamento já está pronto!', time: '14:20', unread: 2, online: true },
    { id: '2', name: 'Ana Oliveira (Cliente)', lastMsg: 'Pode vir amanhã às 10h?', time: 'Ontem', unread: 0, online: false },
  ];

  return (
    <View style={styles.container}>
      {/* Header com Busca */}
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput placeholder="Buscar conversas..." style={styles.searchInput} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['Ativas', 'Arquivadas'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList 
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatCard}>
            <View>
              <View style={styles.avatar} />
              {item.online && <View style={styles.onlineBadge} />}
            </View>
            
            <View style={{ flex: 1, marginLeft: 15 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMsg}</Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FF' 
  },
  header: { 
    padding: 20, 
    backgroundColor: '#FFF', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1A1A1A', 
    marginBottom: 15 
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F2F5', 
    paddingHorizontal: 15, 
    borderRadius: 15, 
    height: 45 
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 10, 
    fontSize: 15 
  },
  tabs: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginTop: 20, 
    gap: 20 
  },
  tab: { 
    paddingBottom: 8, 
    borderBottomWidth: 3, 
    borderBottomColor: 'transparent' 
  },
  tabActive: { 
    borderBottomColor: colors.primary 
  },
  tabText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#999' 
  },
  tabTextActive: { 
    color: colors.primary 
  },
  chatCard: { 
    flexDirection: 'row', 
    padding: 15, 
    marginHorizontal: 20, 
    marginVertical: 8, 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  avatar: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#EEE' 
  },
  onlineBadge: { 
    position: 'absolute', 
    right: 0, 
    bottom: 2, 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    backgroundColor: '#4CAF50', 
    borderWidth: 2, 
    borderColor: '#FFF' 
  },
  userName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  lastMsg: { 
    fontSize: 14, 
    color: '#777', 
    marginTop: 4,
    flex: 1 
  },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  timeText: { 
    fontSize: 12, 
    color: '#AAA' 
  },
  unreadBadge: { 
    backgroundColor: colors.primary, 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  unreadText: { 
    color: '#FFF', 
    fontSize: 11, 
    fontWeight: 'bold' 
  }
});