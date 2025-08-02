import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, DollarSign, Bell, Calendar, Volume2, Save, Palette } from 'lucide-react';
import { useRefillrStore } from '@/store/useRefillrStore';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

export const Settings = () => {
  const { settings, updateSettings, budget, updateBudget } = useRefillrStore();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated",
    });
  };

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const updateBudgetAmount = (value: string) => {
    const amount = parseFloat(value) || 0;
    updateSettings({ monthlyBudget: amount });
    updateBudget({ monthlyLimit: amount });
  };

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
      <Header title="Settings" showNotifications={false} />
      
      <motion.div 
        className="p-4 max-w-md mx-auto space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Theme Settings */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* General Settings */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto Subtract Daily</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically reduce quantities based on daily usage
                  </p>
                </div>
                <Switch
                  checked={settings.autoSubtractDaily}
                  onCheckedChange={() => toggleSetting('autoSubtractDaily')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Refill Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when items are running low
                  </p>
                </div>
                <Switch
                  checked={settings.notifyOnRefillNeeded}
                  onCheckedChange={() => toggleSetting('notifyOnRefillNeeded')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Budget Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track your monthly grocery spending
                  </p>
                </div>
                <Switch
                  checked={settings.budgetTracking}
                  onCheckedChange={() => toggleSetting('budgetTracking')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notification Sound</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound for notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notificationSound}
                  onCheckedChange={() => toggleSetting('notificationSound')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Settings */}
        {settings.budgetTracking && (
          <motion.div variants={cardVariants}>
            <Card className="shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Budget Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-budget">Monthly Budget ($)</Label>
                  <Input
                    id="monthly-budget"
                    type="number"
                    value={settings.monthlyBudget}
                    onChange={(e) => updateBudgetAmount(e.target.value)}
                    placeholder="200"
                    className="bg-muted/50 rounded-xl"
                  />
                  <p className="text-sm text-muted-foreground">
                    Set your target monthly grocery budget
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Notification Preferences */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="flex flex-col items-center p-3 bg-muted/50 rounded-xl cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Daily</span>
                  <span className="text-xs text-muted-foreground">Usage reminders</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center p-3 bg-muted/50 rounded-xl cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Volume2 className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Alerts</span>
                  <span className="text-xs text-muted-foreground">Low stock warnings</span>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* App Information */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">About ReFillr</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center space-y-2">
                <div className="text-4xl">🛒</div>
                <h3 className="font-semibold">ReFillr v2.0</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal diet and grocery inventory manager
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offline Storage:</span>
                  <span className="text-success">✓ Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Sync:</span>
                  <span className="text-muted-foreground">Local Only</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="text-muted-foreground">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={cardVariants}>
          <Button 
            onClick={handleSave} 
            className="w-full bg-gradient-primary hover:opacity-90 transition-smooth rounded-2xl"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </motion.div>
      </motion.div>

      <Navigation />
    </div>
  );
};