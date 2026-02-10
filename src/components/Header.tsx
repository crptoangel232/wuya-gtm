import { Link } from 'react-router-dom';
import { Leaf, BarChart3, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">WUYA</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/opportunities" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Opportunities
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Buyer Contacts
            </Link>
          </Button>
          <Button asChild>
            <Link to="/report" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Report Alert
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
