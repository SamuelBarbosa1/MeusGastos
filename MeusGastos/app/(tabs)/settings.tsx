import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/utils/currency';
import Colors from '@/constants/Colors';

export default function SettingsScreen() {
  const { resetData, setInitialBalance, balance } = useFinance();
  const [newBalance, setNewBalance] = useState('');

  const handleResetData = () => {
    Alert.alert(
      'Confirmar Redefinição',
      'Tem certeza que deseja redefinir todos os dados? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Redefinir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await resetData();
              Alert.alert('Sucesso', 'Todos os dados foram redefinidos com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao redefinir dados');
            }
          }
        }
      ]
    );
  };

  const handleSetInitialBalance = async () => {
    if (!newBalance || parseFloat(newBalance.replace(',', '.')) < 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    try {
      await setInitialBalance(parseFloat(newBalance.replace(',', '.')));
      Alert.alert(
        'Sucesso', 
        `Novo saldo inicial definido: ${formatCurrency(parseFloat(newBalance.replace(',', '.')))}`,
        [{ text: 'OK' }]
      );
      setNewBalance('');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao definir novo saldo inicial');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saldo Atual</Text>
        <Text style={styles.balanceText}>{formatCurrency(balance)}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Redefinir Dados</Text>
        <Text style={styles.description}>
          Esta ação irá apagar todas as transações e redefinir o saldo para zero.
        </Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleResetData} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Redefinir Todos os Dados</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inserir Novo Saldo Inicial</Text>
        <Text style={styles.description}>
          Defina um novo saldo inicial. Isso substituirá o saldo atual.
        </Text>
        <TextInput
          style={styles.input}
          value={newBalance}
          onChangeText={setNewBalance}
          placeholder="0,00"
          keyboardType="numeric"
          selectionColor={Colors.primary}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSetInitialBalance} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Atualizar Saldo Inicial</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: Colors.text,
  },
  section: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.text,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.success,
    textAlign: 'center',
    marginVertical: 10,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});