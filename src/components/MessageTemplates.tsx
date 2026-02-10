import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Mail, Phone, Copy, Check } from 'lucide-react';

interface MessageTemplatesProps {
  produceType: string;
  quantity: number;
  unit: string;
  district: string;
  deadlineDays: number;
}

export function MessageTemplates({ produceType, quantity, unit, district, deadlineDays }: MessageTemplatesProps) {
  const { toast } = useToast();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const whatsappMessage = `Hello, we have ${quantity} ${unit} of fresh ${produceType} in ${district}.\nMust be sold within ${deadlineDays} day${deadlineDays !== 1 ? 's' : ''}.\nCan you buy or connect us to a buyer?\nReply YES and I'll share pickup details.`;

  const emailMessage = `Subject: Urgent: ${quantity} ${unit} of ${produceType} available in ${district}\n\nHi,\n\nWe have ${quantity} ${unit} of fresh ${produceType} available in ${district} that needs to be sold within ${deadlineDays} day${deadlineDays !== 1 ? 's' : ''}.\n\nThe produce is in good condition and ready for immediate pickup.\n\nWould you be interested in purchasing or know someone who might?\n\nPlease reply as soon as possible — time is limited.\n\nThank you,\nWUYA Team`;

  const smsMessage = `URGENT: ${quantity} ${unit} of ${produceType} in ${district}. Must sell in ${deadlineDays} days. Can you buy? Reply YES for details.`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      toast({ title: 'Could not copy', variant: 'destructive' });
    }
  };

  const CopyButton = ({ type, text }: { type: string; text: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, type)}
      className="gap-2"
    >
      {copiedType === type ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {copiedType === type ? 'Copied!' : 'Copy Message'}
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Quick Outreach Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="whatsapp">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="whatsapp" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              SMS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="whatsapp" className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm">{whatsappMessage}</pre>
            </div>
            <CopyButton type="whatsapp" text={whatsappMessage} />
          </TabsContent>
          
          <TabsContent value="email" className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm">{emailMessage}</pre>
            </div>
            <CopyButton type="email" text={emailMessage} />
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm">{smsMessage}</pre>
            </div>
            <CopyButton type="sms" text={smsMessage} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
