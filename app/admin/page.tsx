"use client"

import { useEffect, useState } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users as UsersIcon, List as ListIcon, Search, Edit2, Eye, Trash2 } from "lucide-react"
import { CreateQuizForm } from "@/components/create-quiz-form"
import EditQuizForm from "@/components/EditQuizForm"
import { DialogClose } from "@/components/ui/dialog"

function UserDetailsModal({ user }: { user: any }) {
  if (!user) return null
  return (
    <div className="space-y-4">
      <div><b>Name:</b> {user.name}</div>
      <div><b>Email:</b> {user.email}</div>
      <div><b>Created:</b> {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</div>
      {/* Add more user info as needed */}
    </div>
  )
}

function QuizDetailsModal({ quiz }: { quiz: any }) {
  if (!quiz) return null
  return (
    <div className="space-y-4">
      <div><b>Title:</b> {quiz.title}</div>
      <div><b>Description:</b> {quiz.description}</div>
      <div><b>Difficulty:</b> {quiz.difficulty}</div>
      <div><b>Created:</b> {quiz.created_at ? new Date(quiz.created_at).toLocaleString() : "-"}</div>
      <div><b>Questions:</b>
        <ul className="list-disc ml-6">
          {quiz.questions?.map((q: any, i: number) => (
            <li key={q.id}><b>Q{i+1}:</b> {q.question}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("users")
  const [createOpen, setCreateOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [editUser, setEditUser] = useState<any>(null)
  const [editQuizId, setEditQuizId] = useState<string | null>(null)
  const [deleteUser, setDeleteUser] = useState<any>(null)
  const [deleteQuiz, setDeleteQuiz] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [usersRes, quizzesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/quizzes"),
        ])
        
        // Check if requests were successful
        if (!usersRes.ok) {
          throw new Error(`Failed to fetch users: ${usersRes.status}`)
        }
        if (!quizzesRes.ok) {
          throw new Error(`Failed to fetch quizzes: ${quizzesRes.status}`)
        }

        const usersData = await usersRes.json()
        const quizzesData = await quizzesRes.json()
        
        // Ensure we always have arrays, even if the API returns something else
        setUsers(Array.isArray(usersData) ? usersData : usersData.users || [])
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : quizzesData.quizzes || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        // Set empty arrays on error to prevent filter issues
        setUsers([])
        setQuizzes([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Ensure users and quizzes are always arrays before filtering
  const filteredUsers = Array.isArray(users) ? users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  ) : []

  const filteredQuizzes = Array.isArray(quizzes) ? quizzes.filter(
    (q) =>
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.description?.toLowerCase().includes(search.toLowerCase())
  ) : []

  const refreshData = async () => {
    const [usersRes, quizzesRes] = await Promise.all([
      fetch("/api/users"),
      fetch("/api/quizzes"),
    ])
    const usersData = await usersRes.json()
    const quizzesData = await quizzesRes.json()
    setUsers(Array.isArray(usersData) ? usersData : usersData.users || [])
    setQuizzes(Array.isArray(quizzesData) ? quizzesData : quizzesData.quizzes || [])
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="border-r bg-white dark:bg-gray-900">
          <SidebarHeader>
            <span className="text-xl font-bold">Admin</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={tab === "users"}
                  onClick={() => setTab("users")}
                >
                  <UsersIcon className="mr-2 h-4 w-4" /> Users
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={tab === "quizzes"}
                  onClick={() => setTab("quizzes")}
                >
                  <ListIcon className="mr-2 h-4 w-4" /> Quizzes
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <Input
                placeholder={`Search ${tab}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              {tab === "quizzes" && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="gap-2">
                      <Plus className="h-4 w-4" /> Create Quiz
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Quiz</DialogTitle>
                    </DialogHeader>
                    <CreateQuizForm />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {error && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="text-red-600">Error: {error}</div>
                <Button onClick={() => window.location.reload()} className="mt-2">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div>Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div>No users found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Created</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-2 font-medium">{user.name}</td>
                              <td className="px-4 py-2">{user.email}</td>
                              <td className="px-4 py-2">{user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</td>
                              <td className="px-4 py-2 flex gap-2">
                                <Button size="icon" variant="ghost" onClick={() => setSelectedUser(user)}><Eye className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditUser(user)}><Edit2 className="h-4 w-4" /></Button>
                                <Button size="icon" variant="destructive" onClick={() => setDeleteUser(user)}><Trash2 className="h-4 w-4" /></Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="quizzes">
              <Card>
                <CardHeader>
                  <CardTitle>All Quizzes ({filteredQuizzes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div>Loading quizzes...</div>
                  ) : filteredQuizzes.length === 0 ? (
                    <div>No quizzes found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-left">Difficulty</th>
                            <th className="px-4 py-2 text-left">Creator</th>
                            <th className="px-4 py-2 text-left">Created</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredQuizzes.map((quiz) => (
                            <tr key={quiz.id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-2 font-medium">{quiz.title}</td>
                              <td className="px-4 py-2">{quiz.description}</td>
                              <td className="px-4 py-2">{quiz.difficulty}</td>
                              <td className="px-4 py-2">{quiz.creator_name || "-"}</td>
                              <td className="px-4 py-2">{quiz.created_at ? new Date(quiz.created_at).toLocaleString() : "-"}</td>
                              <td className="px-4 py-2 flex gap-2">
                                <Button size="icon" variant="ghost" onClick={async () => {
                                  setActionLoading(true)
                                  try {
                                    const res = await fetch(`/api/quizzes/${quiz.id}`)
                                    if (res.ok) {
                                      const data = await res.json()
                                      setSelectedQuiz(data)
                                    } else {
                                      console.error('Failed to fetch quiz details')
                                    }
                                  } catch (err) {
                                    console.error('Error fetching quiz details:', err)
                                  }
                                  setActionLoading(false)
                                }}><Eye className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditQuizId(quiz.id)}><Edit2 className="h-4 w-4" /></Button>
                                <Button size="icon" variant="destructive" onClick={() => setDeleteQuiz(quiz)}><Trash2 className="h-4 w-4" /></Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </SidebarInset>
      </div>
      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          <UserDetailsModal user={selectedUser} />
          <DialogClose asChild><Button onClick={() => setSelectedUser(null)}>Close</Button></DialogClose>
        </DialogContent>
      </Dialog>
      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {editUser && (
            <form onSubmit={async (e) => {
              e.preventDefault()
              setActionLoading(true)
              try {
                const form = e.target as HTMLFormElement
                const formData = new FormData(form)
                const updates = { name: formData.get("name"), email: formData.get("email") }
                const res = await fetch(`/api/admin/users/${editUser.id}`, { 
                  method: "PUT", 
                  headers: { "Content-Type": "application/json" }, 
                  body: JSON.stringify(updates) 
                })
                if (res.ok) {
                  await refreshData()
                  setEditUser(null)
                }
              } catch (err) {
                console.error('Error updating user:', err)
              }
              setActionLoading(false)
            }}>
              <div className="space-y-4">
                <Input name="name" defaultValue={editUser.name} placeholder="Name" required />
                <Input name="email" defaultValue={editUser.email} placeholder="Email" required type="email" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                <Button type="submit" disabled={actionLoading}>{actionLoading ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete User Confirmation */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <div>Are you sure you want to delete user <b>{deleteUser?.name}</b>? This cannot be undone.</div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button variant="destructive" disabled={actionLoading} onClick={async () => {
              setActionLoading(true)
              try {
                const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: "DELETE" })
                if (res.ok) {
                  await refreshData()
                  setDeleteUser(null)
                }
              } catch (err) {
                console.error('Error deleting user:', err)
              }
              setActionLoading(false)
            }}>{actionLoading ? "Deleting..." : "Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Quiz Details Modal */}
      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Quiz Details</DialogTitle></DialogHeader>
          <QuizDetailsModal quiz={selectedQuiz} />
          <DialogClose asChild><Button onClick={() => setSelectedQuiz(null)}>Close</Button></DialogClose>
        </DialogContent>
      </Dialog>
      {/* Edit Quiz Modal */}
      <Dialog open={!!editQuizId} onOpenChange={() => setEditQuizId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Quiz</DialogTitle></DialogHeader>
          {editQuizId && <EditQuizForm />}
        </DialogContent>
      </Dialog>
      {/* Delete Quiz Confirmation */}
      <Dialog open={!!deleteQuiz} onOpenChange={() => setDeleteQuiz(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Quiz</DialogTitle></DialogHeader>
          <div>Are you sure you want to delete quiz <b>{deleteQuiz?.title}</b>? This cannot be undone.</div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteQuiz(null)}>Cancel</Button>
            <Button variant="destructive" disabled={actionLoading} onClick={async () => {
              setActionLoading(true)
              try {
                const res = await fetch(`/api/admin/quizzes/${deleteQuiz.id}`, { method: "DELETE" })
                if (res.ok) {
                  await refreshData()
                  setDeleteQuiz(null)
                }
              } catch (err) {
                console.error('Error deleting quiz:', err)
              }
              setActionLoading(false)
            }}>{actionLoading ? "Deleting..." : "Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}