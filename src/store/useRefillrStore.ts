import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InventoryItem, Settings, BudgetData, UsageRecord } from '@/types';

interface RefillrState {
  // Data
  items: InventoryItem[];
  settings: Settings;
  budget: BudgetData;
  usageRecords: UsageRecord[];
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Streak and Analytics
  streak: number;
  lastAutoSubtractDate: string;
  
  // Actions
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  refillItem: (id: string, quantity: number) => void;
  subtractQuantity: (id: string, amount: number) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Budget actions
  updateBudget: (budget: Partial<BudgetData>) => void;
  addExpense: (amount: number) => void;
  
  // Usage tracking
  addUsageRecord: (record: UsageRecord) => void;
  performDailySubtraction: () => void;
  updateStreak: () => void;
  
  // Analytics
  getTodaysCalories: () => number;
  getItemsNeedingRefill: () => InventoryItem[];
  getWeeklyCalorieReport: () => { date: string; calories: number }[];
  getTopConsumedItems: () => { item: InventoryItem; totalUsed: number }[];
}

const generateId = () => crypto.randomUUID();

const initialBudget: BudgetData = {
  monthlyLimit: 200,
  currentSpent: 0,
  month: new Date().toLocaleString('default', { month: 'long' }),
  year: new Date().getFullYear()
};

const initialSettings: Settings = {
  autoSubtractDaily: true,
  notifyOnRefillNeeded: true,
  budgetTracking: true,
  notificationSound: false,
  monthlyBudget: 200
};

export const useRefillrStore = create<RefillrState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      settings: initialSettings,
      budget: initialBudget,
      usageRecords: [],
      theme: 'system',
      streak: 0,
      lastAutoSubtractDate: '',

      // Item actions
      addItem: (itemData) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...itemData,
              id: generateId(),
            },
          ],
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      refillItem: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        })),

      subtractQuantity: (id, amount) =>
        set((state) => {
          const item = state.items.find((item) => item.id === id);
          if (!item) return state;

          const newQuantity = Math.max(0, item.quantity - amount);
          const calories = amount * item.caloriesPerUnit;

          // Add usage record
          const usageRecord: UsageRecord = {
            itemId: id,
            date: new Date().toISOString().split('T')[0],
            quantity: amount,
            calories,
          };

          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: newQuantity } : item
            ),
            usageRecords: [...state.usageRecords, usageRecord],
          };
        }),

      // Settings actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setTheme: (theme) => set({ theme }),

      // Budget actions
      updateBudget: (budgetUpdates) =>
        set((state) => ({
          budget: { ...state.budget, ...budgetUpdates },
        })),

      addExpense: (amount) =>
        set((state) => ({
          budget: {
            ...state.budget,
            currentSpent: state.budget.currentSpent + amount,
          },
        })),

      // Usage tracking
      addUsageRecord: (record) =>
        set((state) => ({
          usageRecords: [...state.usageRecords, record],
        })),

      performDailySubtraction: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.lastAutoSubtractDate === today) return;

        set((currentState) => {
          const updatedItems = currentState.items.map((item) => {
            if (item.autoSubtractDaily && item.dailyUsage) {
              const newQuantity = Math.max(0, item.quantity - item.dailyUsage);
              
              // Add usage record
              const usageRecord: UsageRecord = {
                itemId: item.id,
                date: today,
                quantity: item.dailyUsage,
                calories: item.dailyUsage * item.caloriesPerUnit,
              };

              currentState.usageRecords.push(usageRecord);
              
              return { ...item, quantity: newQuantity };
            }
            return item;
          });

          return {
            items: updatedItems,
            lastAutoSubtractDate: today,
            usageRecords: [...currentState.usageRecords],
          };
        });

        // Update streak
        get().updateStreak();
      },

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        const todaysRecords = state.usageRecords.filter(
          (record) => record.date === today
        );

        if (todaysRecords.length > 0) {
          set((currentState) => ({
            streak: currentState.streak + 1,
          }));
        }
      },

      // Analytics functions
      getTodaysCalories: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        return state.usageRecords
          .filter((record) => record.date === today)
          .reduce((total, record) => total + record.calories, 0);
      },

      getItemsNeedingRefill: () => {
        const state = get();
        return state.items.filter((item) => {
          const threshold = item.refillThreshold || 5;
          return item.quantity <= threshold;
        });
      },

      getWeeklyCalorieReport: () => {
        const state = get();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        return last7Days.map((date) => {
          const calories = state.usageRecords
            .filter((record) => record.date === date)
            .reduce((total, record) => total + record.calories, 0);
          return { date, calories };
        });
      },

      getTopConsumedItems: () => {
        const state = get();
        const itemUsage = new Map<string, number>();

        state.usageRecords.forEach((record) => {
          const current = itemUsage.get(record.itemId) || 0;
          itemUsage.set(record.itemId, current + record.quantity);
        });

        return Array.from(itemUsage.entries())
          .map(([itemId, totalUsed]) => {
            const item = state.items.find((i) => i.id === itemId);
            return item ? { item, totalUsed } : null;
          })
          .filter(Boolean)
          .sort((a, b) => (b?.totalUsed || 0) - (a?.totalUsed || 0))
          .slice(0, 5) as { item: InventoryItem; totalUsed: number }[];
      },
    }),
    {
      name: 'refillr-storage',
      partialize: (state) => ({
        items: state.items,
        settings: state.settings,
        budget: state.budget,
        usageRecords: state.usageRecords,
        theme: state.theme,
        streak: state.streak,
        lastAutoSubtractDate: state.lastAutoSubtractDate,
      }),
    }
  )
);