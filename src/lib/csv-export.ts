interface OpportunityExport {
  id: string;
  produceType: string;
  location: string;
  quantity: number;
  unit: string;
  score: number;
  urgencyLabel: string;
  recommendedAction: string;
  status: string;
  harvestDeadlineDays: number;
  priceDropSeverity: string;
  notes?: string;
  createdAt: string;
}

interface BuyerLeadExport {
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  location?: string;
  source?: string;
}

export function exportOpportunityToCsv(opportunity: OpportunityExport): string {
  const headers = [
    'ID', 'Produce Type', 'Location', 'Quantity', 'Unit', 'Score', 'Urgency',
    'Recommended Action', 'Status', 'Harvest Deadline (Days)', 'Price Drop Severity',
    'Notes', 'Created At',
  ];

  const row = [
    opportunity.id, opportunity.produceType, opportunity.location,
    opportunity.quantity.toString(), opportunity.unit, opportunity.score.toString(),
    opportunity.urgencyLabel, `"${opportunity.recommendedAction}"`, opportunity.status,
    opportunity.harvestDeadlineDays.toString(), opportunity.priceDropSeverity,
    opportunity.notes ? `"${opportunity.notes}"` : '', opportunity.createdAt,
  ];

  return `${headers.join(',')}\n${row.join(',')}`;
}

export function exportLeadsToCsv(leads: BuyerLeadExport[]): string {
  const headers = ['Name', 'Company', 'Role', 'Email', 'Phone', 'LinkedIn URL', 'Location', 'Source'];

  const rows = leads.map((lead) => [
    lead.name, lead.company || '', lead.role || '', lead.email || '',
    lead.phone || '', lead.linkedinUrl || '', lead.location || '', lead.source || '',
  ]);

  return `${headers.join(',')}\n${rows.map((r) => r.join(',')).join('\n')}`;
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
