import { Ionicons } from "@expo/vector-icons";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const colors = { primary: '#007AFF' };

export function TechPublicProfileEdit() {
  return (
    <ScrollView style={stylesTech.container}>
      <View style={stylesTech.previewBanner}>
        <Ionicons name="eye-outline" size={20} color={colors.primary} />
        <Text style={stylesTech.previewText}>Visualizar como cliente vê</Text>
      </View>

      <View style={stylesTech.section}>
        <Text style={stylesTech.sectionTitle}>Sua Bio Profissional</Text>
        <TextInput 
          style={stylesTech.bioInput}
          multiline
          placeholder="Ex: Especialista em hardware Apple e recuperação de dados com 10 anos de experiência..."
        />
      </View>

      <View style={stylesTech.section}>
        <Text style={stylesTech.sectionTitle}>Certificados e Qualificações</Text>
        <TouchableOpacity style={stylesTech.addCertificateBtn}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={stylesTech.addCertificateText}>Adicionar novo certificado</Text>
        </TouchableOpacity>
      </View>

      <View style={stylesTech.section}>
        <Text style={stylesTech.sectionTitle}>Portfólio de Trabalhos</Text>
        <View style={stylesTech.portfolioGrid}>
           {/* Renderização de fotos de serviços concluídos */}
           <View style={stylesTech.photoBox}><Ionicons name="image-outline" size={24} color="#CCC" /></View>
           <View style={stylesTech.photoBox}><Ionicons name="image-outline" size={24} color="#CCC" /></View>
           <View style={stylesTech.photoBox}><Ionicons name="add" size={30} color={colors.primary} /></View>
        </View>
      </View>
    </ScrollView>
  );
}

const stylesTech = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FF' 
  },
  previewBanner: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: colors.primary + '10', 
    gap: 8 
  },
  previewText: { 
    color: colors.primary, 
    fontWeight: 'bold',
    fontSize: 14
  },
  section: { 
    padding: 20,
    backgroundColor: '#FFF',
    marginBottom: 10
  },
  sectionTitle: { 
    fontWeight: 'bold', 
    fontSize: 16,
    color: '#333',
    marginBottom: 12 
  },
  bioInput: { 
    backgroundColor: '#F8F9FF', 
    borderRadius: 15, 
    padding: 15, 
    height: 120, 
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E8EEFF'
  },
  addCertificateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    gap: 10
  },
  addCertificateText: {
    color: colors.primary,
    fontWeight: '600'
  },
  portfolioGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 10, 
    marginTop: 10 
  },
  photoBox: { 
    width: 80, 
    height: 80, 
    borderRadius: 12, 
    backgroundColor: '#F0F2F5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: '#CCC' 
  }
});