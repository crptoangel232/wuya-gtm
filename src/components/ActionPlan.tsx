import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Loader2 } from 'lucide-react';

interface ActionItem {
  id: string;
  task_text: string;
  is_completed: boolean;
  sort_order: number;
}

interface ActionPlanProps {
  opportunityId: string;
  produceType: string;
  location: string;
  quantity: number;
  unit: string;
  deadlineDays: number;
}

function generateDefaultTasks(props: ActionPlanProps): string[] {
  const { produceType, location, quantity, unit, deadlineDays } = props;
  const tasks: string[] = [];

  if (deadlineDays <= 2) {
    tasks.push(`Call top 3 ${location} buyers within 2 hours`);
  } else {
    tasks.push(`Call top 3 ${location} buyers today`);
  }

  tasks.push(`Send WhatsApp message to buyer contacts about ${quantity} ${unit} of ${produceType}`);
  tasks.push(`Confirm pickup location and time with interested buyers`);
  tasks.push(`Arrange transport for ${produceType} (check local trucks)`);
  tasks.push(`Follow up with buyers who haven't replied`);
  tasks.push(`Mark deal as Contacted or Closed`);

  return tasks;
}

export function ActionPlan(props: ActionPlanProps) {
  const { opportunityId } = props;
  const { toast } = useToast();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('action_plan_items')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching action plan:', error);
      return;
    }

    if (data && data.length > 0) {
      setItems(data);
    } else {
      const defaultTasks = generateDefaultTasks(props);
      const inserts = defaultTasks.map((text, i) => ({
        opportunity_id: opportunityId,
        task_text: text,
        is_completed: false,
        sort_order: i,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from('action_plan_items')
        .insert(inserts)
        .select();

      if (!insertError && inserted) {
        setItems(inserted);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [opportunityId]);

  const toggleItem = async (itemId: string, currentState: boolean) => {
    const newState = !currentState;
    
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, is_completed: newState } : item
      )
    );

    const { error } = await supabase
      .from('action_plan_items')
      .update({
        is_completed: newState,
        completed_at: newState ? new Date().toISOString() : null,
      })
      .eq('id', itemId);

    if (error) {
      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, is_completed: currentState } : item
        )
      );
      toast({ title: 'Could not update task', variant: 'destructive' });
    }
  };

  const completedCount = items.filter(i => i.is_completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          48-Hour Action Plan
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{completedCount} of {items.length} steps done</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <label
              key={item.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                item.is_completed ? 'border-primary/20 bg-primary/5' : ''
              }`}
            >
              <Checkbox
                checked={item.is_completed}
                onCheckedChange={() => toggleItem(item.id, item.is_completed)}
                className="mt-0.5"
              />
              <span
                className={`text-sm ${
                  item.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}
              >
                {item.task_text}
              </span>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
