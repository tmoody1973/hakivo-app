import { DashboardHeader } from "@/components/dashboard-header"
import { DailyBriefWidget } from "@/components/widgets/daily-brief-widget"
import { RepresentativesHorizontalWidget } from "@/components/widgets/representatives-horizontal-widget"
import { BillActionsWidget } from "@/components/widgets/bill-actions-widget"
import { EngagementMetricsWidget } from "@/components/widgets/engagement-metrics-widget"
import { PersonalizedNewsWidget } from "@/components/widgets/personalized-news-widget"
import { PersistentAudioPlayer } from "@/components/persistent-audio-player"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader />

      <div className="border-b bg-card">
        <div className="container px-4 md:px-6 py-3">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search legislation, representatives, bills..." className="w-full pl-10" />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-auto pb-24">
        <div className="container py-6 px-4 md:px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Good morning, Jane</h1>
            <p className="text-muted-foreground mt-1">Here's your civic engagement dashboard for today</p>
          </div>

          <div className="space-y-6">
            <RepresentativesHorizontalWidget />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DailyBriefWidget />
              </div>

              <EngagementMetricsWidget />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <BillActionsWidget />

              <PersonalizedNewsWidget />
            </div>
          </div>
        </div>
      </main>

      <PersistentAudioPlayer />
    </div>
  )
}
