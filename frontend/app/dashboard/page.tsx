import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your personalized civic engagement hub
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="briefings">Latest Briefings</TabsTrigger>
            <TabsTrigger value="bills">Recent Bills</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today's Briefing
                  </CardTitle>
                  <Badge>New</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6 minutes</div>
                  <p className="text-xs text-muted-foreground">
                    5 bills affecting your interests
                  </p>
                  <Button className="mt-4 w-full" size="sm">
                    Listen Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Your Representatives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    2 senators, 1 representative
                  </p>
                  <Button className="mt-4 w-full" size="sm" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tracked Bills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    4 updated this week
                  </p>
                  <Button className="mt-4 w-full" size="sm" variant="outline">
                    View All
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Policy Interests</CardTitle>
                <CardDescription>
                  Topics you're following for personalized briefings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Healthcare</Badge>
                  <Badge variant="secondary">Education</Badge>
                  <Badge variant="secondary">Environment</Badge>
                  <Badge variant="secondary">Technology</Badge>
                  <Badge variant="secondary">Economy</Badge>
                </div>
                <Button className="mt-4" variant="outline" size="sm">
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="briefings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Latest Audio Briefings</CardTitle>
                <CardDescription>
                  Your personalized legislative updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Briefings will appear here once your policy interests are configured.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bills</CardTitle>
                <CardDescription>
                  Latest legislation from Congress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bills matching your interests will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personalized News</CardTitle>
                <CardDescription>
                  News articles related to your policy interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  News articles will appear here based on your preferences.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
