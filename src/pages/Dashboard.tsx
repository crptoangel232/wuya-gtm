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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PRODUCE_TYPES, DISTRICTS, URGENCY_LABELS, OPPORTUNITY_STATUS } from '@/lib/constants';
import type { OpportunityStatus, UrgencyLabel } from '@/lib/constants';
import { Eye, RefreshCw, Loader2, Bell, HelpCircle, Package, Users, Zap } from 'lucide-react';
import { format } from 'date-fns';

const PRODUCE_ICONS: Record<string, string> = {
  tomato: '🍅', onion: '🧅', rice: '🌾', cassava: '🥔',
  pepper: '🌶️', potato: '🥔', okra: '🥒',
};

interface OpportunityWithSignal {
  id: string;
  score: number;
  urgency_label: string;
  recommended_action: string;
  status: string;
  created_at: string;
  signals: { produce_type: string; quantity: number; unit: string; district: string } | null;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<OpportunityWithSignal[]>([]);
  const [leadCounts, setLeadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const [produceFilter, setProduceFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, score, urgency_label, recommended_action, status, created_at, signals (produce_type, quantity, unit, district)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);

      if (data && data.length > 0) {
        const { data: leadsData, error: leadsError } = await supabase
          .from('buyer_leads')
          .select('opportunity_id')
          .in('opportunity_id', data.map(o => o.id));

        if (!leadsError && leadsData) {
          const counts: Record<string, number> = {};
          leadsData.forEach(lead => { counts[lead.opportunity_id] = (counts[lead.opportunity_id] || 0) + 1; });
          setLeadCounts(counts);
        }
      }
    } catch (error) {
      console.error('Error fetching:', error);
      toast({ title: 'Could not load opportunities', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    const ch1 = supabase.channel('opp-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => fetchOpportunities()).subscribe();
    const ch2 = supabase.channel('leads-rt').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'buyer_leads' }, (payload) => {
      const nl = payload.new as { opportunity_id: string };
      setLeadCounts(prev => ({ ...prev, [nl.opportunity_id]: (prev[nl.opportunity_id] || 0) + 1 }));
    }).subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, []);

  const updateStatus = async (id: string, newStatus: OpportunityStatus) => {
    setIsUpdating(id);
    try {
      const { error } = await supabase.from('opportunities').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast({ title: 'Status updated' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setIsUpdating(null);
    }
  };

  const filtered = opportunities.filter((o) => {
    if (produceFilter !== 'all' && o.signals?.produce_type !== produceFilter) return false;
    if (districtFilter !== 'all' && o.signals?.district !== districtFilter) return false;
    if (urgencyFilter !== 'all' && o.urgency_label !== urgencyFilter) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3" />Live
            </Badge>
          </div>
          <p className="text-muted-foreground">
            See what produce needs urgent action — sorted by how quickly it needs to sell
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-5 w-5" />Available Produce
                </CardTitle>
                <CardDescription>{filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'} found</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchOpportunities}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <Select value={produceFilter} onValueChange={setProduceFilter}>
                <SelectTrigger><SelectValue placeholder="All Produce" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Produce</SelectItem>
                  {PRODUCE_TYPES.map(t => <SelectItem key={t} value={t}><span className="mr-2">{PRODUCE_ICONS[t] || '🥬'}</span>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger><SelectValue placeholder="All Urgency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  {URGENCY_LABELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {OPPORTUNITY_STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Package className="h-8 w-8 text-muted-foreground" /></div>
                <p className="text-lg font-medium text-foreground">No opportunities yet</p>
                <p className="mt-1 text-sm text-muted-foreground">When someone reports produce, it will appear here</p>
                <Button asChild className="mt-4"><Link to="/report"><Bell className="mr-2 h-4 w-4" />Report a Spoilage Alert</Link></Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produce</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          Score
                          <Tooltip><TooltipTrigger asChild><HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                            <TooltipContent><p className="max-w-xs text-sm">Higher = more urgent to sell</p></TooltipContent></Tooltip>
                        </div>
                      </TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1"><Users className="h-3.5 w-3.5" />Contacts</div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">
                          <span className="mr-2">{PRODUCE_ICONS[o.signals?.produce_type || ''] || '🥬'}</span>
                          <span className="capitalize">{o.signals?.produce_type}</span>
                        </TableCell>
                        <TableCell>{o.signals?.district}</TableCell>
                        <TableCell>{o.signals?.quantity} {o.signals?.unit}</TableCell>
                        <TableCell className="text-center"><ScoreDisplay score={o.score} size="sm" /></TableCell>
                        <TableCell><UrgencyBadge urgency={o.urgency_label as UrgencyLabel} /></TableCell>
                        <TableCell className="text-center">
                          {leadCounts[o.id] ? (
                            <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" />{leadCounts[o.id]}</Badge>
                          ) : <span className="text-muted-foreground text-sm">—</span>}
                        </TableCell>
                        <TableCell>
                          <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OpportunityStatus)} disabled={isUpdating === o.id}>
                            <SelectTrigger className="h-8 w-28"><StatusBadge status={o.status as OpportunityStatus} /></SelectTrigger>
                            <SelectContent>{OPPORTUNITY_STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(o.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/opportunity/${o.id}`}><Eye className="mr-1 h-4 w-4" />View</Link>
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
