# MeusGastos - App de Controle Financeiro

Um aplicativo mobile para controle de finanças pessoais desenvolvido em React Native com Expo.

## Funcionalidades

- Visualização do saldo atual
- Adição de despesas e receitas
- Categorização de transações
- Relatórios com gráficos
- Armazenamento local com AsyncStorage
- Configurações para redefinir dados ou atualizar saldo inicial

## Tecnologias Utilizadas

- React Native
- Expo
- AsyncStorage para armazenamento local
- react-native-chart-kit para gráficos
- Context API para gerenciamento de estado

## Estrutura do Projeto

```
MeusGastos/
├── app/                    # Telas da aplicação
│   ├── (tabs)/            # Telas principais com navegação por tabs
│   │   ├── index.tsx       # Tela inicial
│   │   ├── explore.tsx     # Tela de relatórios
│   │   └── settings.tsx    # Tela de configurações
│   ├── addExpense.tsx      # Tela de adição de despesas
│   ├── addIncome.tsx       # Tela de adição de receitas
│   └── reports.tsx         # Tela de relatórios
├── contexts/               # Contextos do React
│   └── FinanceContext.tsx  # Contexto para gerenciamento financeiro
├── utils/                  # Funções utilitárias
│   └── currency.ts         # Formatação de moeda
└── ...
```

## Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o aplicativo:
   ```bash
   npm start
   ```
4. Escaneie o QR code com o Expo Go ou execute em um emulador

## Telas do Aplicativo

### Tela Inicial
- Exibe o saldo atual
- Botões para adicionar despesas, receitas e ver relatórios

### Adicionar Despesa/Receita
- Formulário para registro de transações
- Seleção de categoria
- Campo opcional para descrição

### Relatórios
- Gráfico de pizza com gastos por categoria
- Gráfico de linha com histórico de saldo
- Resumo das transações

### Configurações
- Redefinir todos os dados
- Inserir novo saldo inicial

## Desenvolvimento

Este projeto foi criado com Expo CLI e utiliza:
- Navegação por tabs
- Armazenamento local com AsyncStorage
- Gráficos para visualização de dados
- Design responsivo

## Contribuição

Sinta-se à vontade para contribuir com melhorias, correções de bugs ou novas funcionalidades.