import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getScoreBreakdown } from '@/lib/scoring';
import { exportOpportunityToCsv, exportLeadsToCsv, downloadCsv } from '@/lib/csv-export';
import { OPPORTUNITY_STATUS } from '@/lib/constants';
import type { OpportunityStatus, UrgencyLabel, PriceDropSeverity } from '@/lib/constants';
import { ArrowLeft, Download, Users, Loader2, ExternalLink, MapPin, Package, Clock, TrendingDown, Target, Info, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

const PRODUCE_ICONS: Record<string, string> = {
  tomato: '🍅',
  onion: '🧅',
  rice: '🌾',
  cassava: '🥔',
  pepper: '🌶️',
  potato: '🥔',
  okra: '🥒',
};

interface Signal {
  id: string;
  produce_type: string;
  quantity: number;
  unit: string;
  district: string;
  harvest_deadline_days: number;
  price_drop_severity: string;
  notes: string | null;
  created_at: string;
}

interface Opportunity {
  id: string;
  score: number;
  urgency_label: string;
  recommended_action: string;
  status: string;
  created_at: string;
  signal_id: string;
  signals: Signal;
}

interface BuyerLead {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  location: string | null;
  source: string | null;
}

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [leads, setLeads] = useState<BuyerLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch opportunity with signal
      const { data: oppData, error: oppError } = await supabase
        .from('opportunities')
        .select(`
          *,
          signals (*)
        `)
        .eq('id', id)
        .single();

      if (oppError) throw oppError;
      setOpportunity(oppData);

      // Fetch buyer leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('buyer_leads')
        .select('*')
        .eq('opportunity_id', id)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading opportunity',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const updateStatus = async (newStatus: OpportunityStatus) => {
    if (!id) return;
    
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setOpportunity((prev) => prev ? { ...prev, status: newStatus } : null);
      toast({ title: 'Status updated' });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const enrichLeads = async () => {
    if (!opportunity) return;
    
    setIsEnriching(true);
    try {
      const response = await supabase.functions.invoke('enrich-leads', {
        body: {
          opportunityId: opportunity.id,
          produceType: opportunity.signals.produce_type,
          district: opportunity.signals.district,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: 'Buyers found!',
        description: `Added ${response.data.leadsAdded} potential buyer contacts`,
      });

      // Refetch leads
      const { data: leadsData } = await supabase
        .from('buyer_leads')
        .select('*')
        .eq('opportunity_id', id)
        .order('created_at', { ascending: false });

      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error enriching leads:', error);
      toast({
        title: 'Enrichment failed',
        description: 'Could not fetch buyer contacts. Using fallback data.',
        variant: 'destructive',
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const handleExportOpportunity = () => {
    if (!opportunity) return;
    
    const csv = exportOpportunityToCsv({
      id: opportunity.id,
      produceType: opportunity.signals.produce_type,
      district: opportunity.signals.district,
      quantity: opportunity.signals.quantity,
      unit: opportunity.signals.unit,
      score: opportunity.score,
      urgencyLabel: opportunity.urgency_label,
      recommendedAction: opportunity.recommended_action,
      status: opportunity.status,
      harvestDeadlineDays: opportunity.signals.harvest_deadline_days,
      priceDropSeverity: opportunity.signals.price_drop_severity,
      notes: opportunity.signals.notes || undefined,
      createdAt: opportunity.created_at,
    });

    downloadCsv(csv, `opportunity-${opportunity.id}.csv`);
    toast({ title: 'Opportunity exported' });
  };

  const handleExportLeads = () => {
    if (leads.length === 0) {
      toast({ title: 'No leads to export', variant: 'destructive' });
      return;
    }

    const csv = exportLeadsToCsv(
      leads.map((lead) => ({
        name: lead.name,
        company: lead.company || undefined,
        role: lead.role || undefined,
        email: lead.email || undefined,
        phone: lead.phone || undefined,
        linkedinUrl: lead.linkedin_url || undefined,
        location: lead.location || undefined,
        source: lead.source || undefined,
      }))
    );

    downloadCsv(csv, `leads-${id}.csv`);
    toast({ title: 'Leads exported' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg text-foreground">Opportunity not found</p>
          <p className="mt-1 text-muted-foreground">This opportunity may have been removed</p>
          <Button asChild className="mt-4">
            <Link to="/opportunities">Back to Opportunities</Link>
          </Button>
        </div>
      </div>
    );
  }

  const scoreBreakdown = getScoreBreakdown({
    harvestDeadlineDays: opportunity.signals.harvest_deadline_days,
    quantity: opportunity.signals.quantity,
    unit: opportunity.signals.unit,
    priceDropSeverity: opportunity.signals.price_drop_severity as PriceDropSeverity,
    district: opportunity.signals.district,
    produceType: opportunity.signals.produce_type,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/opportunities" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunities
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Signal Details Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <span>{PRODUCE_ICONS[opportunity.signals.produce_type] || '🥬'}</span>
                      <span className="capitalize">{opportunity.signals.produce_type}</span>
                      <UrgencyBadge urgency={opportunity.urgency_label as UrgencyLabel} />
                    </CardTitle>
                    <CardDescription>
                      Alert reported on {format(new Date(opportunity.signals.created_at), 'MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={opportunity.status}
                      onValueChange={(value) => updateStatus(value as OpportunityStatus)}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-32">
                        <StatusBadge status={opportunity.status as OpportunityStatus} />
                      </SelectTrigger>
                      <SelectContent>
                        {OPPORTUNITY_STATUS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{opportunity.signals.district}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity Available</p>
                      <p className="font-medium">
                        {opportunity.signals.quantity} {opportunity.signals.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time Until Spoilage</p>
                      <p className="font-medium">
                        {opportunity.signals.harvest_deadline_days} days remaining
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <TrendingDown className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price Drop Severity</p>
                      <p className="font-medium capitalize">{opportunity.signals.price_drop_severity}</p>
                    </div>
                  </div>
                </div>

                {opportunity.signals.notes && (
                  <div className="mt-4 rounded-lg border bg-card p-4">
                    <p className="text-sm font-medium text-muted-foreground">Additional Details</p>
                    <p className="mt-1">{opportunity.signals.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Action Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Recommended Next Step
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{opportunity.recommended_action}</p>
              </CardContent>
            </Card>

            {/* Buyer Leads Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Potential Buyers
                    </CardTitle>
                    <CardDescription>{leads.length} contacts found</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={enrichLeads} disabled={isEnriching}>
                      {isEnriching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finding Buyers...
                        </>
                      ) : (
                        <>
                          <Users className="mr-2 h-4 w-4" />
                          Find Buyers
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportLeads} disabled={leads.length === 0}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* FullEnrich Clarification Note */}
                <Alert className="mb-4 border-muted bg-muted/30">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm text-muted-foreground">
                    Buyer contacts are generated using FullEnrich. If enrichment fails due to rate limits, 
                    demo-safe sample leads will appear instead.
                  </AlertDescription>
                </Alert>

                {leads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">No buyers found yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Click "Find Buyers" to discover potential contacts
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>LinkedIn</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.company || '-'}</TableCell>
                            <TableCell>{lead.role || '-'}</TableCell>
                            <TableCell>
                              {lead.email ? (
                                <a href={`mailto:${lead.email}`} className="text-accent hover:underline">
                                  {lead.email}
                                </a>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{lead.phone || '-'}</TableCell>
                            <TableCell>
                              {lead.linkedin_url ? (
                                <a
                                  href={lead.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Urgency Score
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">
                        Higher = more urgent to sell. Based on spoilage deadline, quantity, and price drop.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ScoreDisplay score={opportunity.score} size="lg" />
                <p className="mt-2 text-sm text-muted-foreground">out of 100</p>
                <UrgencyBadge urgency={opportunity.urgency_label as UrgencyLabel} className="mt-4" />
              </CardContent>
            </Card>

            {/* Score Breakdown Card */}
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scoreBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No scoring factors applied</p>
                ) : (
                  scoreBreakdown.map((item, index) => (
                    <div key={index} className="flex items-start justify-between rounded-lg bg-muted/50 p-3">
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                      <span className="font-bold text-primary">+{item.points}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Export Card */}
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={handleExportOpportunity}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Opportunity
                </Button>
                <Button variant="outline" className="w-full" onClick={handleExportLeads} disabled={leads.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Leads ({leads.length})
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
