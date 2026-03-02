import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Users, Leaf, TrendingDown, Clock, CheckCircle, Store, Truck, Bell, Package, Camera, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import heroFarmerImage from '@/assets/hero-farmer.png';
import communityFarmingImage from '@/assets/community-farming.png';

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'sellers' | 'buyers'>('sellers');

  const sellerSteps = [
    { icon: Bell, title: 'Report produce in minutes', description: 'Tell us what you have, where it is, and how soon it needs to sell', step: '01' },
    { icon: Camera, title: 'Add photos for trust', description: 'Upload photos so buyers can see exactly what\'s available', step: '02' },
    { icon: Search, title: 'Find buyers in hours', description: 'We search for verified buyers matched to your produce and location', step: '03' },
    { icon: CheckCircle, title: 'Save value for farmers', description: 'Close deals fast with ready-made messages and action plans', step: '04' },
  ];

  const buyerSteps = [
    { icon: Package, title: 'See what\'s available now', description: 'Browse produce sorted by urgency — the most time-sensitive shows first', step: '01' },
    { icon: Camera, title: 'View real produce photos', description: 'See photos of condition, packaging, and quantity before you commit', step: '02' },
    { icon: MessageSquare, title: 'Connect with sellers directly', description: 'Get seller details and reach out via WhatsApp, email, or phone', step: '03' },
    { icon: Truck, title: 'Move produce before it spoils', description: 'Secure good prices on fresh produce that needs to move fast', step: '04' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">WUYA</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/opportunities">View Opportunities</Link>
            </Button>
            <Button asChild>
              <Link to="/report">Report Spoilage</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Leaf className="h-4 w-4" />
                  Global Produce Platform
                </div>
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  Turn Spoiling Produce into Sales in{' '}
                  <span className="text-primary">48 Hours</span>
                </h1>
                <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                  WUYA helps field teams report produce that may spoil, prioritize urgent cases, 
                  and connect sellers to verified buyers fast.
                </p>
                
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link to="/report" className="flex items-center justify-center gap-2">
                      <Store className="h-5 w-5" />
                      I'm Selling Produce
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/opportunities" className="flex items-center justify-center gap-2">
                      <Truck className="h-5 w-5" />
                      I'm Looking to Buy
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative hidden lg:block">
                <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src={heroFarmerImage} 
                    alt="Farmer with fresh produce" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-primary/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-4 text-center text-3xl font-bold text-foreground">
                Good produce is going to waste
              </h2>
              <p className="mb-12 text-center text-muted-foreground">
                Every year, thousands of tons of produce spoil worldwide — not because there aren't buyers, 
                but because sellers and buyers can't find each other fast enough.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-foreground">30–40% goes to waste</h3>
                      <p className="text-sm text-muted-foreground">
                        Harvested produce spoils before it reaches a buyer. The market is there — the connection isn't.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-secondary/20 bg-secondary/5">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                      <Clock className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-foreground">Every hour counts</h3>
                      <p className="text-sm text-muted-foreground">
                        Farmers need buyers in days, not weeks. By the time traditional methods work, the produce is gone.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-center text-3xl font-bold text-foreground">How WUYA Works</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              Simple steps to move produce before it spoils.
            </p>
            
            <div className="mx-auto max-w-5xl">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sellers' | 'buyers')} className="w-full">
                <TabsList className="mx-auto mb-10 grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="sellers" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />For Sellers
                  </TabsTrigger>
                  <TabsTrigger value="buyers" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />For Buyers
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="sellers">
                  <div className="grid gap-8 md:grid-cols-4">
                    {sellerSteps.map((step, i) => (
                      <div key={i} className="relative text-center">
                        <div className="mb-4 text-5xl font-bold text-muted/50">{step.step}</div>
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                          <step.icon className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 text-center">
                    <Button size="lg" asChild>
                      <Link to="/report" className="flex items-center gap-2">
                        Report a Spoilage Alert<ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="buyers">
                  <div className="grid gap-8 md:grid-cols-4">
                    {buyerSteps.map((step, i) => (
                      <div key={i} className="relative text-center">
                        <div className="mb-4 text-5xl font-bold text-muted/50">{step.step}</div>
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                          <step.icon className="h-7 w-7 text-accent" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 text-center">
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/opportunities" className="flex items-center gap-2">
                        Browse Opportunities<ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
              <div className="aspect-video overflow-hidden rounded-xl shadow-xl">
                <img 
                  src={communityFarmingImage} 
                  alt="Farming community" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="mb-4 text-3xl font-bold text-foreground">Built for communities worldwide</h2>
                <p className="mb-4 text-muted-foreground">
                  WUYA was created for farmers, traders, and field teams everywhere. 
                  We understand the challenges of getting perishable produce to market on time.
                </p>
                <ul className="space-y-3">
                  {[
                    'Works in any country or region',
                    'Simple enough for field agents on any phone',
                    'Find buyers in hours, not weeks',
                    'Photo uploads build trust with buyers',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-2xl">
              <Users className="mx-auto mb-4 h-12 w-12 text-primary-foreground/80" />
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
                Move produce before it goes bad
              </h2>
              <p className="mb-8 text-primary-foreground/80">
                Join WUYA and connect with verified buyers and sellers worldwide.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/report" className="flex items-center gap-2">
                    <Store className="h-5 w-5" />I'm a Seller
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/opportunities" className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />I'm a Buyer
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 WUYA — Reducing produce waste worldwide</p>
          <p className="mt-1">Connecting sellers and buyers before spoilage happens</p>
        </div>
      </footer>
    </div>
  );
}
