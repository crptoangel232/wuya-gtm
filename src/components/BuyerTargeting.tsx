import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

const BUYER_TYPES = [
  'Distributor',
  'Restaurant',
  'Supermarket',
  'Exporter',
  'NGO Procurement',
  'Aggregator',
] as const;

const TARGET_CITIES = [
  'Freetown',
  'Bo',
  'Kenema',
  'Makeni',
  'Port Loko',
] as const;

interface BuyerTargetingProps {
  buyerType: string;
  targetCity: string;
  buyerKeywords: string;
  onBuyerTypeChange: (v: string) => void;
  onTargetCityChange: (v: string) => void;
  onBuyerKeywordsChange: (v: string) => void;
}

export function BuyerTargeting({
  buyerType,
  targetCity,
  buyerKeywords,
  onBuyerTypeChange,
  onTargetCityChange,
  onBuyerKeywordsChange,
}: BuyerTargetingProps) {
  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-accent" />
          Target Your Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Buyer Type *</Label>
            <Select value={buyerType} onValueChange={onBuyerTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Who are you looking for?" />
              </SelectTrigger>
              <SelectContent>
                {BUYER_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Target City *</Label>
            <Select value={targetCity} onValueChange={onTargetCityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Where should we search?" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Keywords (optional)</Label>
          <Input
            placeholder='e.g. "tomato wholesale", "vegetable distributor"'
            value={buyerKeywords}
            onChange={(e) => onBuyerKeywordsChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Add keywords to help find the right buyers for your produce
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
