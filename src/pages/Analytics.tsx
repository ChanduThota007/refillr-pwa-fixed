import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Calendar, DollarSign, Award, AlertTriangle } from 'lucide-react';
import { useRefillrStore } from '@/store/useRefillrStore';
import { InventoryItem, UsageRecord, BudgetData } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Analytics = () => {
  const { items, usageRecords, budget, getWeeklyCalorieReport, getTopConsumedItems } = useRefillrStore();

  // Calculate analytics data
  const getLastSevenDaysCalories = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayRecords = usageRecords.filter(record => record.date === date);
      const calories = dayRecords.reduce((sum, record) => sum + record.calories, 0);
      const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return { day, calories, date };
    });
  };

  const getMostUsedItems = () => {
    const itemUsage = usageRecords.reduce((acc, record) => {
      const item = items.find(i => i.id === record.itemId);
      if (item) {
        acc[item.name] = (acc[item.name] || 0) + record.quantity;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(itemUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, usage]) => ({ name, usage }));
  };

  const getMostExpiringItem = () => {
    if (items.length === 0) return null;
    
    return items
      .filter(item => new Date(item.expiryDate) > new Date())
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
  };

  const getTotalCaloriesToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return usageRecords
      .filter(record => record.date === today)
      .reduce((sum, record) => sum + record.calories, 0);
  };

  const caloriesData = getLastSevenDaysCalories();
  const mostUsedItems = getMostUsedItems();
  const mostExpiringItem = getMostExpiringItem();
  const todaysCalories = getTotalCaloriesToday();
  const budgetPercentage = budget ? (budget.currentSpent / budget.monthlyLimit) * 100 : 0;

  const categorySpending = items.reduce((acc: any[], item) => {
    const existing = acc.find(cat => cat.name === item.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.category, value: 1, spending: Math.random() * 50 + 10 }); // Mock spending data
    }
    return acc;
  }, []);

  const COLORS = ['hsl(var(--brand-green))', 'hsl(var(--brand-mint))', 'hsl(var(--brand-yellow))', 'hsl(var(--brand-blue))', 'hsl(var(--brand-orange))'];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Analytics & Budget" showNotifications={false} />
      
      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-warm text-accent-foreground shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Today's Calories</p>
                  <p className="text-2xl font-bold">{todaysCalories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-cool text-primary-foreground shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Budget Used</p>
                  <p className="text-2xl font-bold">{budgetPercentage.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Overview */}
        {budget && (
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Monthly Budget - {budget.month} {budget.year}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: ${budget.currentSpent}</span>
                  <span>Limit: ${budget.monthlyLimit}</span>
                </div>
                <Progress value={budgetPercentage} className="h-3" />
                <div className="text-center">
                  <span className={`text-sm font-medium ${budgetPercentage > 90 ? 'text-destructive' : budgetPercentage > 75 ? 'text-warning' : 'text-success'}`}>
                    ${(budget.monthlyLimit - budget.currentSpent).toFixed(2)} remaining
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Calorie Trends */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Calorie Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caloriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Most Used Items */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Most Used Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mostUsedItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No usage data available</p>
            ) : (
              mostUsedItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <Badge variant="outline">{item.usage.toFixed(1)} units</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {categorySpending.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categorySpending.map((category, index) => (
                  <div key={category.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{category.name} ({category.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Insights */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mostExpiringItem && (
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div>
                  <p className="font-medium text-warning">Most Expiring Item</p>
                  <p className="text-sm">{mostExpiringItem.name}</p>
                </div>
                <Badge variant="outline" className="text-warning border-warning">
                  {Math.ceil((new Date(mostExpiringItem.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div>
                <p className="font-medium text-success">Total Items Tracked</p>
                <p className="text-sm">Active inventory items</p>
              </div>
              <Badge variant="outline" className="text-success border-success">
                {items.length} items
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg">
              <div>
                <p className="font-medium text-info">Average Daily Calories</p>
                <p className="text-sm">Based on last 7 days</p>
              </div>
              <Badge variant="outline" className="text-info border-info">
                {Math.round(caloriesData.reduce((sum, day) => sum + day.calories, 0) / 7)} cal
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};