import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEMO_USER,
  DEMO_ACCOUNTS,
  DEMO_BUDGETS,
  DEMO_GOALS,
  DEMO_SUBSCRIPTIONS,
  DEMO_NOTIFICATIONS,
  DEMO_TRANSACTIONS,
  TransactionMock,
  BudgetMock,
  GoalMock,
  SubscriptionMock,
  NotificationMock,
  AccountMock,
  UserMock
} from '../lib/mockData'

interface FinanceState {
  // Data
  user: UserMock | null
  accounts: AccountMock[]
  transactions: TransactionMock[]
  budgets: BudgetMock[]
  goals: GoalMock[]
  subscriptions: SubscriptionMock[]
  notifications: NotificationMock[]
  
  // Settings
  currency: 'USD' | 'EUR' | 'INR' | 'GBP'
  theme: 'light' | 'dark'
  notificationsEnabled: boolean
  isMockMode: boolean

  // Initialization & Sync
  initializeDemo: () => void
  resetAll: () => void
  setIsMockMode: (val: boolean) => void

  // Actions
  // Transactions
  addTransaction: (tx: Omit<TransactionMock, 'id' | 'userId'>) => TransactionMock
  updateTransaction: (tx: TransactionMock) => void
  deleteTransaction: (id: string) => void

  // Budgets
  addBudget: (budget: Omit<BudgetMock, 'id' | 'userId' | 'spent'>) => void
  updateBudget: (budget: BudgetMock) => void
  deleteBudget: (id: string) => void
  recalculateBudgetSpending: () => void

  // Goals
  addGoal: (goal: Omit<GoalMock, 'id' | 'userId' | 'currentAmount'>) => void
  updateGoal: (goal: GoalMock) => void
  contributeToGoal: (id: string, amount: number) => void
  deleteGoal: (id: string) => void

  // Subscriptions
  addSubscription: (sub: Omit<SubscriptionMock, 'id' | 'userId'>) => void
  updateSubscription: (sub: SubscriptionMock) => void
  deleteSubscription: (id: string) => void

  // Notifications
  addNotification: (message: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  // Settings Actions
  setCurrency: (currency: 'USD' | 'EUR' | 'INR' | 'GBP') => void
  setTheme: (theme: 'light' | 'dark') => void
  setNotificationsEnabled: (val: boolean) => void
  updateUser: (name: string, email: string, image?: string) => void
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      // Initial Data State
      user: DEMO_USER,
      accounts: DEMO_ACCOUNTS,
      transactions: DEMO_TRANSACTIONS,
      budgets: DEMO_BUDGETS,
      goals: DEMO_GOALS,
      subscriptions: DEMO_SUBSCRIPTIONS,
      notifications: DEMO_NOTIFICATIONS,

      // Settings
      currency: 'USD',
      theme: 'dark',
      notificationsEnabled: true,
      isMockMode: true, // Default to mock mode until server connection is verified

      // Helpers
      initializeDemo: () => {
        set({
          user: DEMO_USER,
          accounts: DEMO_ACCOUNTS,
          transactions: DEMO_TRANSACTIONS,
          budgets: DEMO_BUDGETS,
          goals: DEMO_GOALS,
          subscriptions: DEMO_SUBSCRIPTIONS,
          notifications: DEMO_NOTIFICATIONS,
        })
        get().recalculateBudgetSpending()
      },

      resetAll: () => {
        set({
          user: null,
          accounts: [],
          transactions: [],
          budgets: [],
          goals: [],
          subscriptions: [],
          notifications: [],
        })
      },

      setIsMockMode: (val) => set({ isMockMode: val }),

      // Transactions
      addTransaction: (tx) => {
        const newTx: TransactionMock = {
          ...tx,
          id: `tx_${Date.now()}`,
          userId: get().user?.id || 'guest',
        }

        const currentTransactions = [newTx, ...get().transactions]
        set({ transactions: currentTransactions })

        // 1. Recalculate account balances
        const accounts = [...get().accounts]
        // Assume default checking account for simplicity
        const mainAccIdx = accounts.findIndex(a => a.type === 'Checking')
        if (mainAccIdx !== -1) {
          const change = tx.type === 'INCOME' ? tx.amount : -tx.amount
          accounts[mainAccIdx] = {
            ...accounts[mainAccIdx],
            balance: parseFloat((accounts[mainAccIdx].balance + change).toFixed(2))
          }
          set({ accounts })
        }

        // 2. Recalculate budgets spent
        get().recalculateBudgetSpending()

        // 3. Create real-time notification
        const sign = tx.type === 'INCOME' ? '+' : '-'
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: get().currency,
        }).format(tx.amount)
        
        get().addNotification(`${sign}${formattedAmount} transaction at ${tx.merchant}`)

        // 4. Trigger budget thresholds notifications
        if (tx.type === 'EXPENSE') {
          const budgets = get().budgets
          const matchingBudget = budgets.find(b => b.category.toLowerCase() === tx.category.toLowerCase())
          if (matchingBudget) {
            const spentPercent = (matchingBudget.spent / matchingBudget.limit) * 100
            if (spentPercent >= 100) {
              get().addNotification(`Budget alert: category "${tx.category}" has exceeded its limit!`)
            } else if (spentPercent >= 90) {
              get().addNotification(`Budget alert: category "${tx.category}" has reached ${Math.round(spentPercent)}% of its limit`)
            }
          }

          // Large expense trigger
          if (tx.amount >= 500) {
            get().addNotification(`Large expense detected: ${formattedAmount} spent at ${tx.merchant}`)
          }
        }

        return newTx
      },

      updateTransaction: (updatedTx) => {
        const transactions = get().transactions.map((tx) =>
          tx.id === updatedTx.id ? updatedTx : tx
        )
        set({ transactions })
        get().recalculateBudgetSpending()
      },

      deleteTransaction: (id) => {
        const txToDelete = get().transactions.find(tx => tx.id === id)
        const transactions = get().transactions.filter((tx) => tx.id !== id)
        set({ transactions })

        if (txToDelete) {
          // Adjust account balance
          const accounts = [...get().accounts]
          const mainAccIdx = accounts.findIndex(a => a.type === 'Checking')
          if (mainAccIdx !== -1) {
            // Revert changes
            const change = txToDelete.type === 'INCOME' ? -txToDelete.amount : txToDelete.amount
            accounts[mainAccIdx] = {
              ...accounts[mainAccIdx],
              balance: parseFloat((accounts[mainAccIdx].balance + change).toFixed(2))
            }
            set({ accounts })
          }
        }

        get().recalculateBudgetSpending()
      },

      // Budgets
      addBudget: (budget) => {
        const newBudget: BudgetMock = {
          ...budget,
          id: `budget_${Date.now()}`,
          userId: get().user?.id || 'guest',
          spent: 0,
        }
        set({ budgets: [...get().budgets, newBudget] })
        get().recalculateBudgetSpending()
      },

      updateBudget: (updatedBudget) => {
        set({
          budgets: get().budgets.map((b) =>
            b.id === updatedBudget.id ? updatedBudget : b
          ),
        })
      },

      deleteBudget: (id) => {
        set({ budgets: get().budgets.filter((b) => b.id !== id) })
      },

      recalculateBudgetSpending: () => {
        const transactions = get().transactions
        const budgets = get().budgets.map((budget) => {
          // Calculate sum of expenses for this category in the current month
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()

          const spent = transactions
            .filter((tx) => {
              const txDate = new Date(tx.date)
              return (
                tx.type === 'EXPENSE' &&
                tx.category.toLowerCase() === budget.category.toLowerCase() &&
                txDate.getMonth() === currentMonth &&
                txDate.getFullYear() === currentYear
              )
            })
            .reduce((sum, tx) => sum + tx.amount, 0)

          return {
            ...budget,
            spent: parseFloat(spent.toFixed(2)),
          }
        })

        set({ budgets })
      },

      // Goals
      addGoal: (goal) => {
        const newGoal: GoalMock = {
          ...goal,
          id: `goal_${Date.now()}`,
          userId: get().user?.id || 'guest',
          currentAmount: 0,
        }
        set({ goals: [...get().goals, newGoal] })
      },

      updateGoal: (updatedGoal) => {
        set({
          goals: get().goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
        })
      },

      contributeToGoal: (id, amount) => {
        const goals = get().goals.map((g) => {
          if (g.id === id) {
            const nextAmount = parseFloat((g.currentAmount + amount).toFixed(2))
            
            // Notification on completion
            if (nextAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
              get().addNotification(`🎉 Congratulations! You met your goal: "${g.name}"!`)
            }
            
            return {
              ...g,
              currentAmount: Math.min(nextAmount, g.targetAmount),
            }
          }
          return g
        })

        set({ goals })

        // Deduct from checking account
        const accounts = [...get().accounts]
        const mainAccIdx = accounts.findIndex(a => a.type === 'Checking')
        if (mainAccIdx !== -1) {
          accounts[mainAccIdx] = {
            ...accounts[mainAccIdx],
            balance: parseFloat((accounts[mainAccIdx].balance - amount).toFixed(2))
          }
          set({ accounts })
        }
      },

      deleteGoal: (id) => {
        set({ goals: get().goals.filter((g) => g.id !== id) })
      },

      // Subscriptions
      addSubscription: (sub) => {
        const newSub: SubscriptionMock = {
          ...sub,
          id: `sub_${Date.now()}`,
          userId: get().user?.id || 'guest',
        }
        set({ subscriptions: [...get().subscriptions, newSub] })
      },

      updateSubscription: (updatedSub) => {
        set({
          subscriptions: get().subscriptions.map((s) =>
            s.id === updatedSub.id ? updatedSub : s
          ),
        })
      },

      deleteSubscription: (id) => {
        set({ subscriptions: get().subscriptions.filter((s) => s.id !== id) })
      },

      // Notifications
      addNotification: (message) => {
        if (!get().notificationsEnabled) return
        const newNotif: NotificationMock = {
          id: `notif_${Date.now()}`,
          userId: get().user?.id || 'guest',
          message,
          read: false,
          createdAt: new Date().toISOString(),
        }
        set({ notifications: [newNotif, ...get().notifications] })

        // Trigger standard browser notification if permission allowed
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new window.Notification('FinPilot AI Alert', { body: message })
        }

        // Trigger real-time cross-tab updates using CustomEvent
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('finpilot-rt-notification', { detail: newNotif }))
        }
      },

      markNotificationRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })
      },

      markAllNotificationsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        })
      },

      // Settings Actions
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
      updateUser: (name, email, image) => {
        const user = get().user
        if (user) {
          set({
            user: {
              ...user,
              name,
              email,
              image: image || user.image,
            },
          })
        }
      },
    }),
    {
      name: 'finpilot-state-store',
    }
  )
)
