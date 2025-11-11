import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BriefsPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audio Briefings</h1>
          <p className="text-muted-foreground">
            Listen to your personalized legislative updates and analysis
          </p>
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">Daily Briefings</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Deep Dives</TabsTrigger>
            <TabsTrigger value="special">Special Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Today's Briefing - November 11, 2025</CardTitle>
                    <CardDescription className="mt-2">
                      6 minutes • 5 bills discussed
                    </CardDescription>
                  </div>
                  <Badge>New</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your daily update on Healthcare, Education, and Environment legislation with special focus on bills from your representatives.
                </p>
                <div className="flex gap-2">
                  <Button>Play Now</Button>
                  <Button variant="outline">Download</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Yesterday's Briefing - November 10, 2025</CardTitle>
                    <CardDescription className="mt-2">
                      5 minutes • 4 bills discussed
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Coverage of technology policy updates and economic legislation relevant to your interests.
                </p>
                <div className="flex gap-2">
                  <Button>Play Now</Button>
                  <Button variant="outline">Download</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Briefing - November 9, 2025</CardTitle>
                    <CardDescription className="mt-2">
                      7 minutes • 6 bills discussed
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Analysis of major healthcare and infrastructure bills with updates from committee hearings.
                </p>
                <div className="flex gap-2">
                  <Button>Play Now</Button>
                  <Button variant="outline">Download</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Week of November 4-10: Top 100 Enacted Laws</CardTitle>
                    <CardDescription className="mt-2">
                      18 minutes • Deep analysis
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Weekly</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  A comprehensive review of the 100 most impactful bills that became law this week, with analysis of their long-term implications.
                </p>
                <div className="flex gap-2">
                  <Button>Play Now</Button>
                  <Button variant="outline">Download</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Week of November 4-10: Presidential Actions</CardTitle>
                    <CardDescription className="mt-2">
                      16 minutes • Executive focus
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Weekly</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  An examination of the president's most impactful legislative priorities and executive actions this week.
                </p>
                <div className="flex gap-2">
                  <Button>Play Now</Button>
                  <Button variant="outline">Download</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="special" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Special Reports</CardTitle>
                <CardDescription>
                  In-depth analysis on major legislative developments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Special reports will appear here for major legislative events.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
