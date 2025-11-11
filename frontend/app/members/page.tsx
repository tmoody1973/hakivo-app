import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function MembersPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Congressional Members</h1>
          <p className="text-muted-foreground">
            Find and follow your representatives and other members of Congress
          </p>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Search by name, state, or district..."
            className="max-w-md"
          />
          <Button>Search</Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Representatives</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle>Sen. John Smith</CardTitle>
                    <CardDescription className="mt-1">
                      Senior Senator • Republican • California
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Finance Committee</Badge>
                  <Badge variant="secondary">Armed Services</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">View Profile</Button>
                  <Button size="sm" variant="outline">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle>Sen. Mary Johnson</CardTitle>
                    <CardDescription className="mt-1">
                      Junior Senator • Democrat • California
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Health Committee</Badge>
                  <Badge variant="secondary">Education</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">View Profile</Button>
                  <Button size="sm" variant="outline">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>RW</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle>Rep. Robert Williams</CardTitle>
                    <CardDescription className="mt-1">
                      Representative • Democrat • CA-12
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Technology</Badge>
                  <Badge variant="secondary">Transportation</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">View Profile</Button>
                  <Button size="sm" variant="outline">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Enter your zip code in preferences to see your actual representatives.</p>
        </div>
      </div>
    </div>
  );
}
