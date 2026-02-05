import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Search, Users, FileSpreadsheet, Leaf, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">WUYA AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/submit">Submit Signal</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-card to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                GTM Intelligence for Agriculture
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Turn Produce Waste into
                <span className="text-primary"> Revenue Opportunities</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                WUYA AI captures urgent market signals about produce at risk of spoilage in Sierra Leone, 
                scores opportunities by urgency, and enriches buyer leads so GTM teams can act fast.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/submit" className="flex items-center gap-2">
                    Submit a Market Signal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
                The Problem We Solve
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-foreground">Food Waste Crisis</h3>
                      <p className="text-sm text-muted-foreground">
                        30-40% of harvested produce in Sierra Leone spoils before reaching buyers due to 
                        poor market visibility and slow response times.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-secondary/20 bg-secondary/5">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                      <AlertTriangle className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-foreground">Market Mismatch</h3>
                      <p className="text-sm text-muted-foreground">
                        Farmers lack real-time connections to buyers while wholesalers struggle to 
                        find urgent supply—leading to missed revenue on both sides.
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
            <h2 className="mb-4 text-center text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              From signal capture to deal closure in four simple steps
            </p>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-4">
              {[
                {
                  icon: AlertTriangle,
                  title: 'Signal',
                  description: 'Field agents submit market signals about produce at risk of spoilage',
                  step: '01',
                },
                {
                  icon: Zap,
                  title: 'Score',
                  description: 'AI scores urgency based on deadline, quantity, and price drop severity',
                  step: '02',
                },
                {
                  icon: Search,
                  title: 'Enrich',
                  description: 'FullEnrich API identifies and enriches potential buyer contacts',
                  step: '03',
                },
                {
                  icon: FileSpreadsheet,
                  title: 'Export',
                  description: 'GTM teams export leads and take action with recommended outreach',
                  step: '04',
                },
              ].map((step, index) => (
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-2xl">
              <Users className="mx-auto mb-4 h-12 w-12 text-primary-foreground/80" />
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
                Ready to Reduce Waste & Drive Revenue?
              </h2>
              <p className="mb-8 text-primary-foreground/80">
                Start capturing market signals today and connect farmers with buyers before it's too late.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/submit" className="flex items-center gap-2">
                    Submit Your First Signal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link to="/dashboard">Explore Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 WUYA AI — Waste-to-Revenue GTM Intelligence Engine</p>
          <p className="mt-1">Built for Sierra Leone's agricultural ecosystem</p>
        </div>
      </footer>
    </div>
  );
}
