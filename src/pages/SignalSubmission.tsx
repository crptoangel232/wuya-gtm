import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PRODUCE_TYPES, DISTRICTS, UNITS, PRICE_DROP_SEVERITY } from '@/lib/constants';
import { calculateScore, getUrgencyLabel, getRecommendedAction } from '@/lib/scoring';
import { Loader2, Bell, AlertTriangle } from 'lucide-react';

const PRODUCE_ICONS: Record<string, string> = {
  tomato: '🍅',
  onion: '🧅',
  rice: '🌾',
  cassava: '🥔',
  pepper: '🌶️',
  potato: '🥔',
  okra: '🥒',
};

export default function SignalSubmission() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    produceType: '',
    quantity: '',
    unit: 'kg',
    district: '',
    harvestDeadlineDays: '',
    priceDropSeverity: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.produceType || !formData.quantity || !formData.district || 
        !formData.harvestDeadlineDays || !formData.priceDropSeverity) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert signal
      const { data: signal, error: signalError } = await supabase
        .from('signals')
        .insert({
          produce_type: formData.produceType,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          district: formData.district,
          harvest_deadline_days: parseInt(formData.harvestDeadlineDays),
          price_drop_severity: formData.priceDropSeverity,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (signalError) throw signalError;

      // Calculate score and create opportunity
      const score = calculateScore({
        harvestDeadlineDays: parseInt(formData.harvestDeadlineDays),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        priceDropSeverity: formData.priceDropSeverity as 'low' | 'medium' | 'high',
        district: formData.district,
        produceType: formData.produceType,
      });

      const urgencyLabel = getUrgencyLabel(score);
      const recommendedAction = getRecommendedAction(
        score,
        formData.produceType,
        formData.district,
        formData.priceDropSeverity as 'low' | 'medium' | 'high'
      );

      const { data: opportunity, error: opportunityError } = await supabase
        .from('opportunities')
        .insert({
          signal_id: signal.id,
          score,
          urgency_label: urgencyLabel,
          recommended_action: recommendedAction,
          status: 'New',
        })
        .select()
        .single();

      if (opportunityError) throw opportunityError;

      toast({
        title: 'Alert submitted successfully!',
        description: `Opportunity created with urgency score ${score} (${urgencyLabel})`,
      });

      navigate(`/opportunity/${opportunity.id}`);
    } catch (error) {
      console.error('Error submitting alert:', error);
      toast({
        title: 'Submission failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Report a Spoilage Alert</h1>
            <p className="mt-2 text-muted-foreground">
              Help us connect your produce to buyers before it's too late
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="h-5 w-5 text-secondary" />
                Produce Details
              </CardTitle>
              <CardDescription>
                Tell us about the produce that needs to be sold quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="produceType">What are you selling? *</Label>
                    <Select
                      value={formData.produceType}
                      onValueChange={(value) => setFormData({ ...formData, produceType: value })}
                    >
                      <SelectTrigger id="produceType">
                        <SelectValue placeholder="Select produce type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCE_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            <span className="mr-2">{PRODUCE_ICONS[type] || '🥬'}</span>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">Where is it located? *</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => setFormData({ ...formData, district: value })}
                    >
                      <SelectTrigger id="district">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">How much do you have? *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter quantity"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="flex-1"
                      />
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="harvestDeadline">Days until spoilage *</Label>
                    <Input
                      id="harvestDeadline"
                      type="number"
                      min="1"
                      max="30"
                      placeholder="e.g., 3 days"
                      value={formData.harvestDeadlineDays}
                      onChange={(e) => setFormData({ ...formData, harvestDeadlineDays: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      How many days before this produce is no longer sellable?
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceDropSeverity">How much has the price dropped? *</Label>
                  <Select
                    value={formData.priceDropSeverity}
                    onValueChange={(value) => setFormData({ ...formData, priceDropSeverity: value })}
                  >
                    <SelectTrigger id="priceDropSeverity">
                      <SelectValue placeholder="Select price drop severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_DROP_SEVERITY.map((severity) => (
                        <SelectItem key={severity} value={severity} className="capitalize">
                          {severity === 'low' && '📉 Low (10-20% below normal)'}
                          {severity === 'medium' && '📉📉 Medium (20-40% below normal)'}
                          {severity === 'high' && '📉📉📉 High (40%+ below normal)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional details (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any other information buyers should know? (condition, storage, transport availability...)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Alert...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Submit Spoilage Alert
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
