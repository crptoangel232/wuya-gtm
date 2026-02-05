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
import { Loader2, Send } from 'lucide-react';

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
        title: 'Signal submitted!',
        description: `Opportunity created with score ${score} (${urgencyLabel} urgency)`,
      });

      navigate(`/opportunity/${opportunity.id}`);
    } catch (error) {
      console.error('Error submitting signal:', error);
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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Submit a Market Signal</CardTitle>
              <CardDescription>
                Report produce at risk of spoilage to create a scored opportunity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="produceType">Produce Type *</Label>
                    <Select
                      value={formData.produceType}
                      onValueChange={(value) => setFormData({ ...formData, produceType: value })}
                    >
                      <SelectTrigger id="produceType">
                        <SelectValue placeholder="Select produce" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCE_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
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
                    <Label htmlFor="quantity">Quantity *</Label>
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
                    <Label htmlFor="harvestDeadline">Harvest Deadline (days until spoilage) *</Label>
                    <Input
                      id="harvestDeadline"
                      type="number"
                      min="1"
                      max="30"
                      placeholder="e.g., 3"
                      value={formData.harvestDeadlineDays}
                      onChange={(e) => setFormData({ ...formData, harvestDeadlineDays: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceDropSeverity">Price Drop Severity *</Label>
                  <Select
                    value={formData.priceDropSeverity}
                    onValueChange={(value) => setFormData({ ...formData, priceDropSeverity: value })}
                  >
                    <SelectTrigger id="priceDropSeverity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_DROP_SEVERITY.map((severity) => (
                        <SelectItem key={severity} value={severity} className="capitalize">
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional context about the situation..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Signal
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
