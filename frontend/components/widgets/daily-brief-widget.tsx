import type React from "react"
import { Play, Clock, Archive } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function DailyBriefWidget() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Today's Brief
        </CardTitle>
        <CardDescription>Your personalized legislative update</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">Daily Legislative Brief</h3>
                <p className="text-sm text-muted-foreground">January 11, 2025</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>7:34</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button size="lg" className="rounded-full h-12 w-12 p-0">
                  <Play className="h-5 w-5 fill-current" />
                </Button>
                <div className="flex-1">
                  <Progress value={35} className="h-2" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Covering 5 bills matching your interests</p>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/briefs">
            <Archive className="mr-2 h-4 w-4" />
            View Archive
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function Radio(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </svg>
  )
}

function Link({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
