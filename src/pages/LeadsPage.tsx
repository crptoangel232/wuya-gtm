import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-export';
import { DISTRICTS } from '@/lib/constants';
import { Download, Users, Loader2, ExternalLink, Search, RefreshCw, CheckCircle, XCircle, Eye, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  location: string | null;
  source: string | null;
  export_status: string | null;
  exported_at: string | null;
  created_at: string;
  opportunity_id: string;
  opportunities?: {
    id: string;
    score: number;
    signals?: { produce_type: string; district: string } | null;
  } | null;
}

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [exportStatusFilter, setExportStatusFilter] = useState<string>('all');

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('buyer_leads')
        .select('*, opportunities (id, score, signals (produce_type, district))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch {
      toast({ title: 'Could not load contacts', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const ch = supabase.channel('all-leads').on('postgres_changes', { event: '*', schema: 'public', table: 'buyer_leads' }, () => fetchLeads()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = leads.filter((lead) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (![lead.name, lead.company, lead.email, lead.role].some(f => f?.toLowerCase().includes(q))) return false;
    }
    if (districtFilter !== 'all' && lead.opportunities?.signals?.district !== districtFilter) return false;
    if (exportStatusFilter === 'exported' && (!lead.export_status || lead.export_status === 'not_exported')) return false;
    if (exportStatusFilter === 'not_exported' && lead.export_status && lead.export_status !== 'not_exported') return false;
    if (exportStatusFilter === 'failed' && lead.export_status !== 'failed') return false;
    return true;
  });

  const handleExport = () => {
    if (filtered.length === 0) return;
    const csv = exportLeadsToCsv(filtered.map(l => ({
      name: l.name, company: l.company || undefined, role: l.role || undefined,
      email: l.email || undefined, phone: l.phone || undefined,
      linkedinUrl: l.linkedin_url || undefined, location: l.location || undefined,
      source: l.source || undefined,
    })));
    downloadCsv(csv, `buyer-contacts-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast({ title: `Exported ${filtered.length} contacts` });
  };

  const getExportBadge = (status: string | null) => {
    if (!status || status === 'not_exported') return <Badge variant="outline" className="text-xs">Not exported</Badge>;
    if (status === 'failed') return <Badge variant="destructive" className="text-xs gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
    if (status.startsWith('exported_to_')) {
      const crm = status.replace('exported_to_', '');
      return <Badge variant="secondary" className="text-xs gap-1"><CheckCircle className="h-3 w-3" />{crm.charAt(0).toUpperCase() + crm.slice(1)}</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Buyer Contacts</h1>
            <Badge variant="outline" className="flex items-center gap-1 text-xs"><Zap className="h-3 w-3" />Live</Badge>
          </div>
          <p className="text-muted-foreground">All verified buyer contacts across opportunities</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl"><Users className="h-5 w-5" />All Contacts</CardTitle>
                <CardDescription>{filtered.length} of {leads.length} contacts</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchLeads}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={exportStatusFilter} onValueChange={setExportStatusFilter}>
                <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_exported">Not Exported</SelectItem>
                  <SelectItem value="exported">Exported</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Users className="h-8 w-8 text-muted-foreground" /></div>
                <p className="text-lg font-medium text-foreground">No contacts found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {leads.length === 0 ? 'Use "Find Buyers" on an opportunity to get started' : 'Try adjusting your filters'}
                </p>
                {leads.length === 0 && <Button asChild className="mt-4"><Link to="/opportunities">View Opportunities</Link></Button>}
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
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(lead => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.company || '-'}</TableCell>
                        <TableCell>{lead.role || '-'}</TableCell>
                        <TableCell>
                          {lead.email ? <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a> : '-'}
                        </TableCell>
                        <TableCell>{lead.phone || '-'}</TableCell>
                        <TableCell>
                          {lead.opportunities?.signals ? (
                            <Link to={`/opportunity/${lead.opportunity_id}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                              <span className="capitalize">{lead.opportunities.signals.produce_type}</span>
                              <span className="text-muted-foreground">({lead.opportunities.signals.district})</span>
                            </Link>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{getExportBadge(lead.export_status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(lead.created_at), 'MMM d')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {lead.linkedin_url && <Button variant="ghost" size="sm" asChild><a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}
                            <Button variant="ghost" size="sm" asChild><Link to={`/opportunity/${lead.opportunity_id}`}><Eye className="h-4 w-4" /></Link></Button>
                          </div>
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
