import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/utils/currency';
import Colors from '@/constants/Colors';
import { useState } from 'react';

export default function HomeScreen() {
  const { balance, transactions, setInitialBalance } = useFinance();
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [newBalance, setNewBalance] = useState('');

  // Calculate income and expenses
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleAddBalance = async () => {
    if (!newBalance || parseFloat(newBalance.replace(',', '.')) < 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    try {
      await setInitialBalance(parseFloat(newBalance.replace(',', '.')) + balance);
      Alert.alert('Sucesso', `Novo saldo adicionado: ${formatCurrency(parseFloat(newBalance.replace(',', '.')))}`);
      setNewBalance('');
      setShowAddBalance(false);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao adicionar saldo');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header with welcome message */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>MeusGastos</Text>
          <Text style={styles.subtitle}>Controle suas finanças</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
          <View style={styles.balanceDetails}>
            <View style={styles.incomeExpenseContainer}>
              <Text style={styles.incomeLabel}>Receitas</Text>
              <Text style={styles.incomeAmount}>{formatCurrency(income)}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.incomeExpenseContainer}>
              <Text style={styles.expenseLabel}>Despesas</Text>
              <Text style={styles.expenseAmount}>{formatCurrency(expenses)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Text style={styles.sectionTitle}>Transações</Text>
          
          <View style={styles.buttonRow}>
            <Link href="/addIncome" asChild>
              <TouchableOpacity style={[styles.actionButton, styles.incomeButton]} activeOpacity={0.8}>
                <Text style={styles.actionButtonIcon}>+</Text>
                <Text style={styles.actionButtonText}>RECEITA</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/addExpense" asChild>
              <TouchableOpacity style={[styles.actionButton, styles.expenseButton]} activeOpacity={0.8}>
                <Text style={styles.actionButtonIcon}>−</Text>
                <Text style={[styles.actionButtonText, styles.darkText]}>DESPESA</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Add Balance Button */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.balanceButton]} 
            activeOpacity={0.8}
            onPress={() => setShowAddBalance(true)}
          >
            <Text style={styles.actionButtonIcon}>💰</Text>
            <Text style={[styles.actionButtonText, styles.darkText]}>ADICIONAR SALDO</Text>
          </TouchableOpacity>

          {showAddBalance && (
            <View style={styles.addBalanceContainer}>
              <Text style={styles.addBalanceTitle}>Adicionar Saldo</Text>
              <TextInput
                style={styles.balanceInput}
                value={newBalance}
                onChangeText={setNewBalance}
                placeholder="0,00"
                keyboardType="numeric"
                placeholderTextColor="#999"
                autoFocus={true}
              />
              <View style={styles.buttonRowCentered}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  activeOpacity={0.8}
                  onPress={() => {
                    setShowAddBalance(false);
                    setNewBalance('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  activeOpacity={0.8}
                  onPress={handleAddBalance}
                >
                  <Text style={styles.modalButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 30,
    paddingTop: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e0e0',
    textAlign: 'center',
    marginTop: 5,
  },
  balanceContainer: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  balanceLabel: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginVertical: 15,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  incomeExpenseContainer: {
    alignItems: 'center',
    flex: 1,
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  incomeLabel: {
    fontSize: 16,
    color: Colors.success,
  },
  incomeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.success,
    marginTop: 5,
  },
  expenseLabel: {
    fontSize: 16,
    color: Colors.danger,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.danger,
    marginTop: 5,
  },
  buttonsContainer: {
    padding: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'left',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  incomeButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  expenseButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  balanceButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.info,
    marginBottom: 20,
  },
  actionButtonIcon: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: 'bold',
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  darkText: {
    color: Colors.text,
  },
  addBalanceContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addBalanceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  balanceInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 15,
    padding: 15,
    fontSize: 20,
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonRowCentered: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});