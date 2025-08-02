import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRefillrStore } from '@/store/useRefillrStore';
import { InventoryItem, CategoryType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const categories: CategoryType[] = ['Dairy', 'Grains', 'Protein', 'Vegetables', 'Fruits', 'Beverages', 'Snacks', 'Other'];
const units = ['grams', 'pieces', 'litres', 'kg', 'ml'] as const;

export const AddItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const addItem = useRefillrStore((state) => state.addItem);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'pieces' as const,
    caloriesPerUnit: '',
    autoSubtractDaily: true,
    dailyUsage: '',
    refillThreshold: ''
  });
  
  const [purchaseDate, setPurchaseDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.quantity || !formData.caloriesPerUnit || !purchaseDate || !expiryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newItemData = {
      name: formData.name,
      category: formData.category as CategoryType,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      caloriesPerUnit: parseFloat(formData.caloriesPerUnit),
      purchaseDate: purchaseDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      autoSubtractDaily: formData.autoSubtractDaily,
      dailyUsage: formData.dailyUsage ? parseFloat(formData.dailyUsage) : undefined,
      notes: '',
      refillThreshold: formData.refillThreshold ? parseFloat(formData.refillThreshold) : undefined
    };

    addItem(newItemData);
    
    toast({
      title: "Item Added",
      description: `${newItemData.name} has been added to your inventory`,
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Add New Item" showNotifications={false} />
      
      <div className="p-4 max-w-md mx-auto">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Item Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Milk, Eggs, Bread"
                  className="bg-muted/50"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={formData.unit} onValueChange={(value: any) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calories per Unit */}
              <div className="space-y-2">
                <Label htmlFor="calories">Calories per {formData.unit.slice(0, -1)} *</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.caloriesPerUnit}
                  onChange={(e) => setFormData({ ...formData, caloriesPerUnit: e.target.value })}
                  placeholder="0"
                  className="bg-muted/50"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Purchase Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-muted/50",
                          !purchaseDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {purchaseDate ? format(purchaseDate, "MMM dd") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={purchaseDate}
                        onSelect={setPurchaseDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Expiry Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-muted/50",
                          !expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiryDate ? format(expiryDate, "MMM dd") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        initialFocus
                        className="pointer-events-auto"
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Auto Subtract Daily Toggle */}
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-subtract" className="text-sm font-medium">
                    Auto Subtract Daily
                  </Label>
                  <Switch
                    id="auto-subtract"
                    checked={formData.autoSubtractDaily}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoSubtractDaily: checked })}
                  />
                </div>
                
                {formData.autoSubtractDaily && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="daily-usage" className="text-sm">Daily Usage</Label>
                      <Input
                        id="daily-usage"
                        type="number"
                        step="0.1"
                        value={formData.dailyUsage}
                        onChange={(e) => setFormData({ ...formData, dailyUsage: e.target.value })}
                        placeholder="0"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refill-threshold" className="text-sm">Refill Alert At</Label>
                      <Input
                        id="refill-threshold"
                        type="number"
                        step="0.1"
                        value={formData.refillThreshold}
                        onChange={(e) => setFormData({ ...formData, refillThreshold: e.target.value })}
                        placeholder="5"
                        className="bg-background"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-smooth">
                <Save className="mr-2 h-4 w-4" />
                Save Item
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};