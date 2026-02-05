import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PRODUCE_TYPES, DISTRICTS, URGENCY_LABELS, OPPORTUNITY_STATUS } from '@/lib/constants';
import type { OpportunityStatus, UrgencyLabel } from '@/lib/constants';
import { Eye, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface OpportunityWithSignal {
  id: string;
  score: number;
  urgency_label: string;
  recommended_action: string;
  status: string;
  created_at: string;
  signals: {
    produce_type: string;
    quantity: number;
    unit: string;
    district: string;
  } | null;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<OpportunityWithSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filters
  const [produceFilter, setProduceFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          id,
          score,
          urgency_label,
          recommended_action,
          status,
          created_at,
          signals (
            produce_type,
            quantity,
            unit,
            district
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast({
        title: 'Error loading data',
        description: 'Could not load opportunities.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const updateStatus = async (opportunityId: string, newStatus: OpportunityStatus) => {
    setIsUpdating(opportunityId);
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: newStatus })
        .eq('id', opportunityId);

      if (error) throw error;

      setOpportunities((prev) =>
        prev.map((opp) =>
          opp.id === opportunityId ? { ...opp, status: newStatus } : opp
        )
      );

      toast({
        title: 'Status updated',
        description: `Changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update failed',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (produceFilter !== 'all' && opp.signals?.produce_type !== produceFilter) return false;
    if (districtFilter !== 'all' && opp.signals?.district !== districtFilter) return false;
    if (urgencyFilter !== 'all' && opp.urgency_label !== urgencyFilter) return false;
    if (statusFilter !== 'all' && opp.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Opportunities Dashboard</CardTitle>
                <CardDescription>
                  {filteredOpportunities.length} opportunities found
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchOpportunities}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <Select value={produceFilter} onValueChange={setProduceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by produce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Produce</SelectItem>
                  {PRODUCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  {URGENCY_LABELS.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {OPPORTUNITY_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-lg font-medium text-muted-foreground">No opportunities found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting filters or submit a new signal
                </p>
                <Button asChild className="mt-4">
                  <Link to="/submit">Submit Signal</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produce</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead className="max-w-[200px]">Recommended Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOpportunities.map((opp) => (
                      <TableRow key={opp.id}>
                        <TableCell className="font-medium capitalize">
                          {opp.signals?.produce_type}
                        </TableCell>
                        <TableCell>{opp.signals?.district}</TableCell>
                        <TableCell>
                          {opp.signals?.quantity} {opp.signals?.unit}
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreDisplay score={opp.score} size="sm" />
                        </TableCell>
                        <TableCell>
                          <UrgencyBadge urgency={opp.urgency_label as UrgencyLabel} />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {opp.recommended_action}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={opp.status}
                            onValueChange={(value) => updateStatus(opp.id, value as OpportunityStatus)}
                            disabled={isUpdating === opp.id}
                          >
                            <SelectTrigger className="h-8 w-28">
                              <StatusBadge status={opp.status as OpportunityStatus} />
                            </SelectTrigger>
                            <SelectContent>
                              {OPPORTUNITY_STATUS.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(opp.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/opportunity/${opp.id}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
