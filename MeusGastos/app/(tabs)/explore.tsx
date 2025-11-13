import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/utils/currency';
import Colors from '@/constants/Colors';

export default function ReportsScreen() {
  const { transactions, balance } = useFinance();
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
  const [showBalanceHistory, setShowBalanceHistory] = useState(true);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    const expenseCategories: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        if (expenseCategories[transaction.category]) {
          expenseCategories[transaction.category] += transaction.amount;
        } else {
          expenseCategories[transaction.category] = transaction.amount;
        }
      }
    });

    const chartData = Object.entries(expenseCategories).map(([category, amount], index) => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      return {
        name: category,
        amount: amount,
        color: colors[index % colors.length],
        legendFontColor: '#333',
        legendFontSize: 15,
      };
    });

    setExpenseData(chartData);

    if (transactions.length > 0) {
      const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let runningBalance = 0;
      const history = sortedTransactions.map(transaction => {
        if (transaction.type === 'income') {
          runningBalance += transaction.amount;
        } else {
          runningBalance -= transaction.amount;
        }
        
        return {
          date: formatDate(transaction.date),
          balance: runningBalance,
        };
      });

      setBalanceHistory(history);
      setFilteredHistory(history);
    } else {
      const history = [{
        date: formatDate(new Date().toISOString()),
        balance: balance,
      }];
      setBalanceHistory(history);
      setFilteredHistory(history);
    }
  }, [transactions, balance]);

  useEffect(() => {
    if (filterPeriod === 'all') {
      setFilteredHistory(balanceHistory);
      return;
    }

    const now = new Date();
    let startDate = new Date();

    if (filterPeriod === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (filterPeriod === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    const filtered = balanceHistory.filter(item => {
      const itemDate = new Date(item.date.split('/').reverse().join('-'));
      return itemDate >= startDate;
    });

    setFilteredHistory(filtered);
  }, [filterPeriod, balanceHistory]);

  const formatDate = (dateString: string): string => {
    if (!dateString) {
      return 'Data inválida';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatChartDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getMaxLabels = (data: any[], maxLabels: number = 5) => {
    if (data.length <= maxLabels) return data;
    
    const step = Math.ceil(data.length / maxLabels);
    return data.filter((_, index) => index % step === 0);
  };

  const chartDataWithLimitedLabels = getMaxLabels(filteredHistory);
  
  const lineChartData = {
    labels: chartDataWithLimitedLabels.map(item => item.date),
    datasets: [
      {
        data: chartDataWithLimitedLabels.map(item => item.balance),
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#f0f4f8',
    backgroundGradientTo: '#f0f4f8',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4a90e2',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Relatórios</Text>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
        {expenseData.length > 0 ? (
          <>
            <PieChart
              data={expenseData}
              width={350}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
              hasLegend={false}
            />

            <View style={styles.categoryDetails}>
              {expenseData.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>Nenhum dado disponível</Text>
        )}
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Histórico de Saldo</Text>
          <TouchableOpacity 
            onPress={() => setShowBalanceHistory(!showBalanceHistory)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleButtonText}>
              {showBalanceHistory ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filterPeriod === 'all' && styles.activeFilterButton]}
            onPress={() => setFilterPeriod('all')}
          >
            <Text style={[styles.filterButtonText, filterPeriod === 'all' && styles.activeFilterButtonText]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filterPeriod === 'week' && styles.activeFilterButton]}
            onPress={() => setFilterPeriod('week')}
          >
            <Text style={[styles.filterButtonText, filterPeriod === 'week' && styles.activeFilterButtonText]}>
              Última Semana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filterPeriod === 'month' && styles.activeFilterButton]}
            onPress={() => setFilterPeriod('month')}
          >
            <Text style={[styles.filterButtonText, filterPeriod === 'month' && styles.activeFilterButtonText]}>
              Último Mês
            </Text>
          </TouchableOpacity>
        </View>

        {filteredHistory.length > 0 ? (
          <>
            <LineChart
              data={{
                labels: [],
                datasets: [
                  {
                    data: filteredHistory.map(item => item.balance),
                    strokeWidth: 2,
                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                  },
                ],
              }}
              width={Dimensions.get('window').width - 60}   // <-- AJUSTE
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f0f4f8',
                backgroundGradientTo: '#f0f4f8',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#4a90e2',
                },
                fillShadowGradient: '#4a90e2',
                fillShadowGradientOpacity: 0.1,
              }}
              bezier
              style={styles.lineChart}
              yAxisLabel="R$ "   // <-- AJUSTE
              yAxisSuffix=""
              fromZero={false}
              withVerticalLines={false}
              withDots={true}
              withInnerLines={true}
              withHorizontalLines={true}
              withScrollableDot={false}
              formatYLabel={(value) => {
                const numValue = parseFloat(value);
                return `R$ ${numValue.toFixed(0)}`;
              }}
              withShadow={true}
              segments={4}
            />

            {showBalanceHistory && (
              <View style={styles.balanceHistory}>
                {filteredHistory.map((item, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyDate}>{item.date}</Text>
                    <Text style={styles.historyBalance}>{formatCurrency(item.balance)}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.noDataText}>Nenhum dado disponível</Text>
        )}
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: Colors.text,
  },
  chartContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  toggleButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  noDataText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontStyle: 'italic',
    padding: 20,
  },
  categoryDetails: {
    marginTop: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  colorBox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 10,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  lineChart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  balanceHistory: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  historyBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
