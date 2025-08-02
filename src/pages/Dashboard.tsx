import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Calendar, Flame, TrendingUp, Zap } from 'lucide-react';
import { useRefillrStore } from '@/store/useRefillrStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const {
    items,
    streak,
    getTodaysCalories,
    getItemsNeedingRefill,
    performDailySubtraction,
    updateStreak
  } = useRefillrStore();

  const todaysCalories = getTodaysCalories();
  const itemsNeedingRefill = getItemsNeedingRefill();

  useEffect(() => {
    performDailySubtraction();
    updateStreak();
  }, [performDailySubtraction, updateStreak]);

  const getQuantityColor = (item: any) => {
    const threshold = item.refillThreshold || 5;
    const percentage = (item.quantity / threshold) * 100;
    
    if (percentage <= 100) return 'text-destructive';
    if (percentage <= 200) return 'text-warning';
    return 'text-success';
  };

  const getQuantityProgress = (item: any) => {
    const threshold = item.refillThreshold || 5;
    return Math.min((item.quantity / (threshold * 3)) * 100, 100);
  };

  const dailyItems = items.filter(item => item.autoSubtractDaily).slice(0, 6);

  const categoryData = items.reduce((acc: any[], item) => {
    const existing = acc.find(cat => cat.name === item.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['hsl(var(--brand-green))', 'hsl(var(--brand-mint))', 'hsl(var(--brand-yellow))', 'hsl(var(--brand-blue))', 'hsl(var(--brand-orange))'];

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="ReFillr" />
      
      <motion.div 
        className="p-4 max-w-md mx-auto space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Date Banner */}
        <motion.div variants={cardVariants} className="text-center py-2">
          <p className="text-sm text-muted-foreground">{today}</p>
        </motion.div>

        {/* Today's Summary Cards */}
        <motion.div variants={cardVariants} className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-warm text-accent-foreground shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-2">
                <Flame className="h-5 w-5" />
                <div className="text-center">
                  <p className="text-xs font-medium">Calories</p>
                  <p className="text-lg font-bold">{todaysCalories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-cool text-primary-foreground shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <div className="text-center">
                  <p className="text-xs font-medium">Low Stock</p>
                  <p className="text-lg font-bold">{itemsNeedingRefill.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-accent text-secondary-foreground shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-2">
                <Zap className="h-5 w-5" />
                <div className="text-center">
                  <p className="text-xs font-medium">Streak</p>
                  <p className="text-lg font-bold">{streak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Items */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Daily Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No daily items configured</p>
              ) : (
                dailyItems.map((item) => (
                  <motion.div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted/70 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className={`text-sm font-bold ${getQuantityColor(item)}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={getQuantityProgress(item)} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Daily: {item.dailyUsage} {item.unit}</span>
                          <span>{item.caloriesPerUnit * (item.dailyUsage || 0)} cal</span>
                        </div>
                      </div>
                    </div>
                    {itemsNeedingRefill.some(refillItem => refillItem.id === item.id) && (
                      <Badge variant="destructive" className="ml-2">
                        Low
                      </Badge>
                    )}
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Overview */}
        {categoryData.length > 0 && (
          <motion.div variants={cardVariants}>
            <Card className="shadow-soft rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Inventory Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {categoryData.map((category, index) => (
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
          </motion.div>
        )}

        {/* Refill Alerts */}
        {itemsNeedingRefill.length > 0 && (
          <motion.div variants={cardVariants}>
            <Card className="shadow-soft border-warning rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  Refill Needed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {itemsNeedingRefill.map((item) => (
                  <motion.div 
                    key={item.id} 
                    className="flex items-center justify-between p-2 bg-warning/10 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="outline" className="text-warning border-warning">
                      {item.quantity} {item.unit} left
                    </Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <Navigation />
    </div>
  );
};