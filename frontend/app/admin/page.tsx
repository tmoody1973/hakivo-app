"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Database, Download, RefreshCw, Users, FileText, Building2 } from "lucide-react"

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://svc-01k9ssx7tazc5e34ccs4yt1gqn.01k66gywmx8x4r0w31fdjjfekf.lmapp.run"

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

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [bills, setBills] = useState<Bill[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [ingesting, setIngesting] = useState(false)

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
      await Promise.all([fetchStats(), fetchBills(), fetchMembers(), fetchCommittees()])
      setLoading(false)
    }
    loadData()
  }, [])

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
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totals.bills.toLocaleString() || 0}</div>
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
                <div className="text-2xl font-bold">{stats?.totals.members.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Congressional representatives</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Committees</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totals.committees.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">House and Senate committees</p>
              </CardContent>
            </Card>
          </div>

          {/* Ingestion Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Data Ingestion Controls</CardTitle>
              <CardDescription>Trigger Congress.gov API data sync</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              {ingesting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Ingestion in progress...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Tables */}
          <Tabs defaultValue="bills" className="space-y-4">
            <TabsList>
              <TabsTrigger value="bills">Bills ({bills.length})</TabsTrigger>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="committees">Committees ({committees.length})</TabsTrigger>
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
                          <TableCell className="text-xs text-muted-foreground">
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
          </Tabs>
        </div>
      </main>
    </div>
  )
}
