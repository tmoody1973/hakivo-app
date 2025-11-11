import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BillsPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Congressional Bills</h1>
          <p className="text-muted-foreground">
            Search and explore legislation from the 118th and 119th Congress
          </p>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Search bills by title, topic, or bill number..."
            className="max-w-md"
          />
          <Button>Search</Button>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>H.R. 1234 - Sample Healthcare Act</CardTitle>
                  <CardDescription className="mt-2">
                    Sponsored by Rep. Smith • Introduced 11/01/2024
                  </CardDescription>
                </div>
                <Badge>Healthcare</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                A bill to amend the Public Health Service Act to provide for healthcare improvements and expansions...
              </p>
              <div className="flex gap-2">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">
                  Ask AI
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>S. 567 - Education Funding Reform Act</CardTitle>
                  <CardDescription className="mt-2">
                    Sponsored by Sen. Johnson • Introduced 10/15/2024
                  </CardDescription>
                </div>
                <Badge>Education</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                A bill to reform federal education funding mechanisms and increase support for public schools...
              </p>
              <div className="flex gap-2">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">
                  Ask AI
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>H.R. 8910 - Climate Action Initiative</CardTitle>
                  <CardDescription className="mt-2">
                    Sponsored by Rep. Williams • Introduced 09/20/2024
                  </CardDescription>
                </div>
                <Badge>Environment</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                A bill to establish comprehensive climate action programs and reduce carbon emissions...
              </p>
              <div className="flex gap-2">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">
                  Ask AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Showing 3 of 1,247 bills. Connect to API to load real data.</p>
        </div>
      </div>
    </div>
  );
}
