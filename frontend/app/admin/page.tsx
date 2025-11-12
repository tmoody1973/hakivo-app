"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Database, Download, RefreshCw, Users, FileText, Building2, Search, Eye } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://svc-01k9t94gnv5bcdwxqz22fzhh40.01k66gywmx8x4r0w31fdjjfekf.lmapp.run"
// Use local API proxy to avoid CORS issues with Raindrop services
const BILL_INDEXER_URL = "/api/bill-indexer"

interface Stats {
  totals: {
    bills: number
    members: number
    committees: number
  }
  latestBills: Array<{
    id: string
    title: string
    congress: number
    bill_type: string
    bill_number: number
    latest_action_date: string | null
  }>
  congressBreakdown: Array<{
    congress: number
    count: number
  }>
}

interface Bill {
  id: string
  title: string
  congress: number
  bill_type: string
  bill_number: number
  sponsor_id: string | null
  introduced_date: string | null
  latest_action_date: string | null
  latest_action_text: string | null
  policy_area: string | null
  summary: string | null
  full_text: string | null
  full_text_url: string | null
  _metadata?: {
    cosponsors_count: number
    actions_count: number
    subjects_count: number
  }
  cosponsors?: Array<{
    bioguide_id: string
    first_name: string
    last_name: string
    party: string
    state: string
    sponsored_date: string
  }>
  actions?: Array<{
    action_date: string
    action_text: string
    action_type: string
  }>
  subjects?: string[]
}

interface Member {
  id: string
  first_name: string
  last_name: string
  party: string | null
  state: string
  chamber: string
  district: string | null
}

interface Committee {
  id: string
  name: string
  chamber: string
  committee_type: string | null
}

interface InterestCategory {
  id: string
  name: string
  description: string
  icon: string
  keywords: string[]
  policyAreas: string[]
  color: string
  created_at: string
}

interface IndexingStatus {
  indexed: number
  total: number
  remaining: number
  percentComplete: number
}

interface IndexedBill {
  name: string
  path: string
  size: number
  uploaded: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [bills, setBills] = useState<Bill[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [committees, setCommittees] = useState<Committee[]>([])
  const [interestCategories, setInterestCategories] = useState<InterestCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [ingesting, setIngesting] = useState(false)
  const [liveUpdates, setLiveUpdates] = useState(false)
  const [selectedBillText, setSelectedBillText] = useState<{ id: string; title: string; text: string } | null>(null)
  const [indexingStatus, setIndexingStatus] = useState<IndexingStatus | null>(null)
  const [indexing, setIndexing] = useState(false)
  const [indexedBills, setIndexedBills] = useState<IndexedBill[]>([])
  const [loadingIndexed, setLoadingIndexed] = useState(false)
  const [selectedBillContent, setSelectedBillContent] = useState<{key: string; content: string} | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)

  const fetchStats = async () => {
    try {
      const res = await fetch(`${ADMIN_API_URL}/admin/stats`)
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchBills = async () => {
    try {
      const res = await fetch(`${ADMIN_API_URL}/admin/bills?limit=50`)
      const data = await res.json()
      setBills(data.bills || [])
    } catch (error) {
      console.error("Failed to fetch bills:", error)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${ADMIN_API_URL}/admin/members?limit=50`)
      const data = await res.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error("Failed to fetch members:", error)
    }
  }

  const fetchCommittees = async () => {
    try {
      const res = await fetch(`${ADMIN_API_URL}/admin/committees`)
      const data = await res.json()
      setCommittees(data.committees || [])
    } catch (error) {
      console.error("Failed to fetch committees:", error)
    }
  }

  const fetchInterestCategories = async () => {
    try {
      const res = await fetch(`${ADMIN_API_URL}/admin/interest-categories`)
      const data = await res.json()
      setInterestCategories(data.categories || [])
    } catch (error) {
      console.error("Failed to fetch interest categories:", error)
    }
  }

  const fetchIndexingStatus = async () => {
    try {
      const res = await fetch(`${BILL_INDEXER_URL}/status`)
      const data = await res.json()
      setIndexingStatus(data)
    } catch (error) {
      console.error("Failed to fetch indexing status:", error)
    }
  }

  const fetchIndexedBills = async () => {
    setLoadingIndexed(true)
    try {
      const res = await fetch(`${BILL_INDEXER_URL}/list`)
      const data = await res.json()
      setIndexedBills(data.bills || [])
    } catch (error) {
      console.error("Failed to fetch indexed bills:", error)
    } finally {
      setLoadingIndexed(false)
    }
  }

  const viewBillContent = async (key: string) => {
    setLoadingContent(true)
    try {
      const encodedKey = encodeURIComponent(key)
      const res = await fetch(`${BILL_INDEXER_URL}/content/${encodedKey}`)
      const data = await res.json()
      if (data.content) {
        setSelectedBillContent({ key, content: data.content })
      } else {
        alert("Failed to load bill content")
      }
    } catch (error) {
      console.error("Failed to fetch bill content:", error)
      alert("Failed to load bill content")
    } finally {
      setLoadingContent(false)
    }
  }

  const triggerIndexing = async (limit: number = 100, offset: number = 0) => {
    setIndexing(true)
    try {
      const res = await fetch(`${BILL_INDEXER_URL}/index`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit, offset, batchSize: 10 }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Indexing complete! Indexed: ${data.indexed}, Failed: ${data.failed}`)
        await Promise.all([fetchIndexingStatus(), fetchIndexedBills()])
      } else {
        alert(`Failed to trigger indexing: ${res.statusText}`)
      }
    } catch (error) {
      console.error("Indexing error:", error)
      alert("Failed to trigger indexing")
    } finally {
      setIndexing(false)
    }
  }

  const triggerIngestion = async (type: "bills" | "members" | "committees", congress?: number) => {
    setIngesting(true)
    try {
      const body: any = { type }
      if (congress) body.congress = congress
      if (type === "members") body.limit = 250

      const res = await fetch(`${ADMIN_API_URL}/admin/ingest/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        alert(`${type} ingestion started for Congress ${congress || "current"}!`)
        // Refresh stats after a delay
        setTimeout(fetchStats, 3000)
      } else {
        alert(`Failed to trigger ingestion: ${res.statusText}`)
      }
    } catch (error) {
      console.error("Ingestion error:", error)
      alert("Failed to trigger ingestion")
    } finally {
      setIngesting(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchBills(), fetchMembers(), fetchCommittees(), fetchInterestCategories(), fetchIndexingStatus(), fetchIndexedBills()])
      setLoading(false)
    }
    loadData()
  }, [])

  // Live updates polling
  useEffect(() => {
    if (!liveUpdates) return

    const interval = setInterval(async () => {
      await Promise.all([fetchStats(), fetchBills(), fetchIndexingStatus(), fetchIndexedBills()])
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [liveUpdates])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Hakivo Admin</h1>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="container mx-auto space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats?.totals.bills ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Congress 119: {stats?.congressBreakdown.find((c) => c.congress === 119)?.count || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Congress 118: {stats?.congressBreakdown.find((c) => c.congress === 118)?.count || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats?.totals.members ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Congressional representatives</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Committees</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats?.totals.committees ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">House and Senate committees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bills Indexed</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(indexingStatus?.indexed ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {indexingStatus?.percentComplete || 0}% complete
                </p>
                <Progress value={indexingStatus?.percentComplete || 0} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {(indexingStatus?.remaining ?? 0).toLocaleString()} remaining
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ingestion Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Data Ingestion Controls</CardTitle>
              <CardDescription>Trigger Congress.gov API data sync and monitor live updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setLiveUpdates(!liveUpdates)}
                    variant={liveUpdates ? "default" : "outline"}
                    size="sm"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${liveUpdates ? "animate-spin" : ""}`} />
                    {liveUpdates ? "Live Updates ON" : "Live Updates OFF"}
                  </Button>
                  {liveUpdates && (
                    <span className="text-xs text-muted-foreground">
                      Refreshing every 3 seconds
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium mb-2">Congress Data Ingestion</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => triggerIngestion("bills", 119)} disabled={ingesting}>
                      <Download className="mr-2 h-4 w-4" />
                      Ingest Congress 119 Bills
                    </Button>
                    <Button onClick={() => triggerIngestion("bills", 118)} disabled={ingesting} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Ingest Congress 118 Bills
                    </Button>
                    <Button onClick={() => triggerIngestion("members")} disabled={ingesting} variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Ingest Members
                    </Button>
                    <Button onClick={() => triggerIngestion("committees")} disabled={ingesting} variant="outline">
                      <Building2 className="mr-2 h-4 w-4" />
                      Ingest Committees
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">SmartBucket Indexing</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => triggerIndexing(100, 0)} disabled={indexing} variant="default">
                      <Search className="mr-2 h-4 w-4" />
                      Index 100 Bills
                    </Button>
                    <Button onClick={() => triggerIndexing(500, 0)} disabled={indexing} variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Index 500 Bills
                    </Button>
                    <Button onClick={fetchIndexingStatus} disabled={indexing} variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Status
                    </Button>
                  </div>
                  {indexingStatus && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {indexingStatus.indexed} of {indexingStatus.total} bills indexed ({indexingStatus.percentComplete}%)
                    </p>
                  )}
                </div>
              </div>
              {(ingesting || indexing) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {ingesting ? "Ingestion" : "Indexing"} in progress...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Tables */}
          <Tabs defaultValue="bills" className="space-y-4">
            <TabsList>
              <TabsTrigger value="bills">Bills ({bills.length})</TabsTrigger>
              <TabsTrigger value="indexed">Indexed Bills ({indexedBills.length})</TabsTrigger>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="committees">Committees ({committees.length})</TabsTrigger>
              <TabsTrigger value="interests">Interest Categories ({interestCategories.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="bills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bills</CardTitle>
                  <CardDescription>Latest 50 bills from the database</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Congress</TableHead>
                        <TableHead>Policy Area</TableHead>
                        <TableHead>Cosponsors</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Full Text</TableHead>
                        <TableHead>Latest Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-mono text-sm">
                            {bill.bill_type.toUpperCase()}{bill.bill_number}
                          </TableCell>
                          <TableCell className="max-w-md truncate">{bill.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{bill.congress}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{bill.policy_area || "—"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{bill._metadata?.cosponsors_count || 0}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{bill._metadata?.actions_count || 0}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{bill._metadata?.subjects_count || 0}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                            {bill.summary ? bill.summary.substring(0, 100) + "..." : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {bill.full_text ? (
                              <Badge
                                variant="default"
                                className="bg-green-600 cursor-pointer hover:bg-green-700"
                                onClick={() => setSelectedBillText({
                                  id: bill.id,
                                  title: bill.title,
                                  text: bill.full_text!
                                })}
                              >
                                {Math.round(bill.full_text.length / 1024)}KB
                              </Badge>
                            ) : bill.full_text_url ? (
                              <a href={bill.full_text_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                Link
                              </a>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {bill.latest_action_date
                              ? new Date(bill.latest_action_date).toLocaleDateString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="indexed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Indexed Bills in SmartBucket</CardTitle>
                  <CardDescription>
                    Bills currently indexed for semantic search ({indexedBills.length} bills)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingIndexed ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading indexed bills...</span>
                    </div>
                  ) : indexedBills.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No bills have been indexed yet. Use the "Index Bills" buttons above to start indexing.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill ID</TableHead>
                          <TableHead>Congress</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Number</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead>Path</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {indexedBills.map((bill) => {
                          // Extract bill details from path like "bills/119/HR-1245.txt"
                          const pathParts = bill.path.split('/')
                          const congress = pathParts[1]
                          const billFile = pathParts[2]?.replace('.txt', '') || ''
                          const [billType, billNumber] = billFile.split('-')

                          return (
                            <TableRow key={bill.path}>
                              <TableCell className="font-mono text-sm">{billFile}</TableCell>
                              <TableCell>{congress}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{billType}</Badge>
                              </TableCell>
                              <TableCell>{billNumber}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {(bill.size / 1024).toFixed(1)} KB
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(bill.uploaded).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">
                                {bill.path}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => viewBillContent(bill.path)}
                                  disabled={loadingContent}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Congressional Members</CardTitle>
                  <CardDescription>Latest 50 members from the database</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Party</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Chamber</TableHead>
                        <TableHead>District</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.first_name} {member.last_name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                member.party === "Democratic"
                                  ? "default"
                                  : member.party === "Republican"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {member.party || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.state}</TableCell>
                          <TableCell>{member.chamber}</TableCell>
                          <TableCell>{member.district || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="committees" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Congressional Committees</CardTitle>
                  <CardDescription>All committees from the database</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Chamber</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>System Code</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {committees.map((committee) => (
                        <TableRow key={committee.id}>
                          <TableCell className="font-medium">{committee.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{committee.chamber}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{committee.committee_type || "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {committee.id}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Interest Categories</CardTitle>
                  <CardDescription>12 citizen-friendly categories that map to Congress.gov policy areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Icon</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Keywords</TableHead>
                        <TableHead>Policy Areas</TableHead>
                        <TableHead>Color</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interestCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="text-2xl">{category.icon}</TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="max-w-xs text-sm text-muted-foreground">
                            {category.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{category.keywords.length} keywords</Badge>
                            <div className="mt-1 text-xs text-muted-foreground max-w-xs truncate">
                              {category.keywords.slice(0, 5).join(', ')}...
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{category.policyAreas.length} areas</Badge>
                            <div className="mt-1 text-xs text-muted-foreground max-w-xs">
                              {category.policyAreas.join(', ')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`bg-${category.color}-100 text-${category.color}-800 border-${category.color}-300`}>
                              {category.color}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Full Text Modal */}
      {selectedBillText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedBillText(null)}>
          <div className="relative max-h-[90vh] w-[90vw] max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
              <div>
                <h2 className="text-lg font-semibold">{selectedBillText.id}</h2>
                <p className="text-sm text-muted-foreground">{selectedBillText.title}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedBillText(null)}>
                Close
              </Button>
            </div>
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <div
                className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap font-mono"
                dangerouslySetInnerHTML={{ __html: selectedBillText.text }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Indexed Bill Content Modal */}
      {selectedBillContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedBillContent(null)}>
          <div className="relative max-h-[90vh] w-[90vw] max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
              <div>
                <h2 className="text-lg font-semibold">Indexed Bill Content</h2>
                <p className="text-sm text-muted-foreground">{selectedBillContent.key}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedBillContent(null)}>
                Close
              </Button>
            </div>
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <pre className="text-gray-900 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                {selectedBillContent.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
