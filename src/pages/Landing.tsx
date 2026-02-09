import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Search, Users, FileSpreadsheet, Leaf, TrendingDown, AlertTriangle, Store, Truck, Clock, CheckCircle, Bell, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import real Sierra Leone images
import heroFarmerImage from '@/assets/hero-farmer.png';
import communityFarmingImage from '@/assets/community-farming.png';

const PRODUCE_ICONS: Record<string, string> = {
  tomato: '🍅',
  onion: '🧅',
  rice: '🌾',
  cassava: '🥔',
  pepper: '🌶️',
  potato: '🥔',
  okra: '🥒',
};

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'sellers' | 'buyers'>('sellers');

  const sellerSteps = [
    {
      icon: Bell,
      title: 'Report a Spoilage Alert',
      description: 'Submit produce details: type, location, quantity, and how many days until spoilage',
      step: '01',
    },
    {
      icon: Zap,
      title: 'WUYA Scores Urgency',
      description: 'Our system calculates an urgency score (0–100) based on deadline, quantity, and price drop',
      step: '02',
    },
    {
      icon: Search,
      title: 'Buyers Are Matched Instantly',
      description: 'Verified buyer contacts are enriched and matched to your produce type and location',
      step: '03',
    },
    {
      icon: CheckCircle,
      title: 'Close the Sale Faster',
      description: 'Get buyer contact details and recommended actions to move produce before it spoils',
      step: '04',
    },
  ];

  const buyerSteps = [
    {
      icon: AlertTriangle,
      title: 'Receive High-Urgency Opportunities',
      description: 'Get notified about produce that needs to move fast — scored by urgency',
      step: '01',
    },
    {
      icon: Package,
      title: 'See Verified Supply Details',
      description: 'View produce type, quantity, location, and exact spoilage timeline',
      step: '02',
    },
    {
      icon: Users,
      title: 'Contact Sellers Immediately',
      description: 'Use enriched seller details to reach out and negotiate directly',
      step: '03',
    },
    {
      icon: Truck,
      title: 'Secure Produce Before Spoilage',
      description: 'Move fast, reduce waste, and get better prices on time-sensitive inventory',
      step: '04',
    },
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
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-card to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Leaf className="h-4 w-4" />
                  Made for Sierra Leone's Agricultural Community
                </div>
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  Turn Spoiling Produce into Sales in{' '}
                  <span className="text-primary">48 Hours</span>
                </h1>
                <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                  WUYA helps field teams report at-risk produce, prioritize urgent cases, and connect 
                  sellers to verified buyers in hours — not days.
                </p>
                
                {/* Dual CTA Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" asChild className="flex-1 sm:flex-initial">
                    <Link to="/report" className="flex items-center justify-center gap-2">
                      <Store className="h-5 w-5" />
                      I'm a Seller (Report Produce)
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="flex-1 sm:flex-initial">
                    <Link to="/opportunities" className="flex items-center justify-center gap-2">
                      <Truck className="h-5 w-5" />
                      I'm a Buyer (View Opportunities)
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="relative hidden lg:block">
                <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src={heroFarmerImage} 
                    alt="Sierra Leone farmer harvesting rice in the fields" 
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Decorative overlay */}
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-primary/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-4 text-center text-3xl font-bold text-foreground">
                The Problem We're Solving
              </h2>
              <p className="mb-12 text-center text-muted-foreground">
                Every year, thousands of tons of produce spoil in Sierra Leone — not because of scarcity, 
                but because sellers and buyers can't find each other fast enough.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-foreground">30–40% Waste Rate</h3>
                      <p className="text-sm text-muted-foreground">
                        Harvested produce spoils before reaching buyers due to poor market visibility 
                        and slow response times.
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
                      <h3 className="mb-2 font-semibold text-foreground">Time Is Money</h3>
                      <p className="text-sm text-muted-foreground">
                        Farmers need buyers within days, not weeks. Traditional methods are too slow 
                        when produce is already at risk.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Tabbed */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-center text-3xl font-bold text-foreground">How WUYA Works</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              Whether you're selling produce or looking to buy, WUYA connects you to the right people at the right time.
            </p>
            
            <div className="mx-auto max-w-5xl">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sellers' | 'buyers')} className="w-full">
                <TabsList className="mx-auto mb-10 grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="sellers" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    For Sellers
                  </TabsTrigger>
                  <TabsTrigger value="buyers" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    For Buyers
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="sellers">
                  <div className="grid gap-8 md:grid-cols-4">
                    {sellerSteps.map((step, index) => (
                      <div key={index} className="relative text-center">
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
                        Report a Spoilage Alert
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="buyers">
                  <div className="grid gap-8 md:grid-cols-4">
                    {buyerSteps.map((step, index) => (
                      <div key={index} className="relative text-center">
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
                        Browse Opportunities
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* About Section with Image Placeholder */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
              {/* Community Farming Image */}
              <div className="aspect-video overflow-hidden rounded-xl shadow-xl">
                <img 
                  src={communityFarmingImage} 
                  alt="Sierra Leone farmers working together harvesting vegetables" 
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div>
                <h2 className="mb-4 text-3xl font-bold text-foreground">Built for Our Community</h2>
                <p className="mb-4 text-muted-foreground">
                  WUYA was created specifically for Sierra Leone's agricultural ecosystem. We understand the 
                  challenges our farmers and traders face every day.
                </p>
                <ul className="space-y-3">
                  {[
                    'Works across all 14 districts',
                    'Supports local produce types',
                    'Simple enough for field agents',
                    'Fast enough to beat spoilage',
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

        {/* CTA Section */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-2xl">
              <Users className="mx-auto mb-4 h-12 w-12 text-primary-foreground/80" />
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
                Ready to Move Produce Faster?
              </h2>
              <p className="mb-8 text-primary-foreground/80">
                Join WUYA today and connect with verified buyers and sellers across Sierra Leone.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/report" className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    I'm a Seller
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link to="/opportunities" className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    I'm a Buyer
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 WUYA — Reducing Produce Waste Across Sierra Leone</p>
          <p className="mt-1">Connecting sellers and buyers before spoilage happens</p>
        </div>
      </footer>
    </div>
  );
}
