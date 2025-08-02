import { useState } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit3, Plus, Minus, StickyNote, Trash2, RefreshCw } from 'lucide-react';
import { useRefillrStore } from '@/store/useRefillrStore';
import { InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const EditRefill = () => {
  const { items, updateItem, refillItem, removeItem, subtractQuantity } = useRefillrStore();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [notes, setNotes] = useState('');
  const [refillAmount, setRefillAmount] = useState('');
  const { toast } = useToast();

  const handleRefill = () => {
    if (!selectedItem || !refillAmount) return;
    
    const amount = parseFloat(refillAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid refill amount",
        variant: "destructive"
      });
      return;
    }

    refillItem(selectedItem.id, amount);
    updateItem(selectedItem.id, { purchaseDate: new Date().toISOString().split('T')[0] });

    toast({
      title: "Item Refilled",
      description: `Added ${amount} ${selectedItem.unit} to ${selectedItem.name}`,
    });

    setRefillAmount('');
    setSelectedItem(null);
  };

  const handleUseItem = (amount: number) => {
    if (!selectedItem) return;

    subtractQuantity(selectedItem.id, amount);

    toast({
      title: "Usage Recorded",
      description: `Used ${amount} ${selectedItem.unit} of ${selectedItem.name}`,
    });

    setSelectedItem({ ...selectedItem, quantity: Math.max(0, selectedItem.quantity - amount) });
  };

  const handleAddNotes = () => {
    if (!selectedItem || !notes.trim()) return;

    const existingNotes = selectedItem.notes || '';
    const newNotes = existingNotes 
      ? `${existingNotes}\n${new Date().toLocaleDateString()}: ${notes}`
      : `${new Date().toLocaleDateString()}: ${notes}`;

    updateItem(selectedItem.id, { notes: newNotes });

    toast({
      title: "Notes Added",
      description: "Notes have been saved to the item",
    });

    setNotes('');
    setSelectedItem({ ...selectedItem, notes: newNotes });
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;

    removeItem(selectedItem.id);
    
    toast({
      title: "Item Deleted",
      description: `${selectedItem.name} has been removed from inventory`,
    });

    setSelectedItem(null);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryBadgeVariant = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return 'destructive';
    if (days <= 3) return 'destructive';
    if (days <= 7) return 'secondary';
    return 'outline';
  };

  if (selectedItem) {
    const expiryDays = getDaysUntilExpiry(selectedItem.expiryDate);
    
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Edit Item" showNotifications={false} />
        
        <div className="p-4 max-w-md mx-auto space-y-4">
          <Card className="shadow-soft rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{selectedItem.name}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  Back
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedItem.category}</Badge>
                <Badge variant={getExpiryBadgeVariant(selectedItem.expiryDate)}>
                  {expiryDays >= 0 ? `${expiryDays} days left` : 'Expired'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Quantity</p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedItem.quantity} {selectedItem.unit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Calories per unit</p>
                  <p className="text-xl font-semibold">
                    {selectedItem.caloriesPerUnit} cal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Minus className="h-5 w-5 text-primary" />
                Quick Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleUseItem(1)}
                  disabled={selectedItem.quantity < 1}
                >
                  -1
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleUseItem(selectedItem.dailyUsage || 1)}
                  disabled={selectedItem.quantity < (selectedItem.dailyUsage || 1)}
                >
                  Daily Use
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleUseItem(5)}
                  disabled={selectedItem.quantity < 5}
                >
                  -5
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Refill Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={refillAmount}
                  onChange={(e) => setRefillAmount(e.target.value)}
                  placeholder={`Amount in ${selectedItem.unit}`}
                  className="flex-1 bg-muted/50 rounded-xl"
                />
                <Button onClick={handleRefill} disabled={!refillAmount}>
                  <Plus className="h-4 w-4 mr-1" />
                  Refill
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-primary" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedItem.notes && (
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-sm whitespace-pre-line">{selectedItem.notes}</p>
                </div>
              )}
              <div className="space-y-2">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note..."
                  className="bg-muted/50 rounded-xl"
                />
                <Button 
                  onClick={handleAddNotes} 
                  disabled={!notes.trim()}
                  className="w-full rounded-xl"
                  variant="outline"
                >
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-destructive/20 rounded-2xl">
            <CardContent className="pt-6">
              <Button 
                onClick={handleDeleteItem}
                variant="destructive"
                className="w-full rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </Button>
            </CardContent>
          </Card>
        </div>

        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Edit & Refill" />
      
      <div className="p-4 max-w-md mx-auto">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Select Item to Edit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No items in inventory</p>
            ) : (
              items.map((item) => {
                const expiryDays = getDaysUntilExpiry(item.expiryDate);
                const isLowStock = item.quantity <= (item.refillThreshold || 5);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted/70 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        {isLowStock && (
                          <Badge variant="destructive" className="text-xs">Low</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getExpiryBadgeVariant(item.expiryDate)} className="text-xs">
                        {expiryDays >= 0 ? `${expiryDays}d` : 'Expired'}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};