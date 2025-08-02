export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'grams' | 'pieces' | 'litres' | 'kg' | 'ml';
  caloriesPerUnit: number;
  purchaseDate: string;
  expiryDate: string;
  autoSubtractDaily: boolean;
  dailyUsage?: number;
  notes?: string;
  refillThreshold?: number;
}

export interface BudgetData {
  monthlyLimit: number;
  currentSpent: number;
  month: string;
  year: number;
}

export interface Settings {
  autoSubtractDaily: boolean;
  notifyOnRefillNeeded: boolean;
  budgetTracking: boolean;
  notificationSound: boolean;
  monthlyBudget: number;
}

export interface UsageRecord {
  itemId: string;
  date: string;
  quantity: number;
  calories: number;
}

export type CategoryType = 'Dairy' | 'Grains' | 'Protein' | 'Vegetables' | 'Fruits' | 'Beverages' | 'Snacks' | 'Other';