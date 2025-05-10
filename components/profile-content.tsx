"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Save, User, Bell, Lock, LogOut, Upload, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ProfileContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
    }

    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [status, router, session])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError("")

    try {
      // Here you would typically send the profile data to your API
      console.log({
        name,
        email,
        bio,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div>Loading profile...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details and public information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={session.user.image || "/placeholder.svg"} alt={name} />
                      <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tell us about yourself"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Badges</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-500">Quiz Master</Badge>
                    <Badge className="bg-blue-500">Early Adopter</Badge>
                    <Badge className="bg-green-500">Perfect Score</Badge>
                    <Badge className="bg-yellow-500">Speed Demon</Badge>
                    <Badge className="bg-pink-500">Knowledge Seeker</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="account">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Account Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Account Type</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Member Since</span>
                      <span>May 2023</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Upgrade to Premium
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Security
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Change Password</Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <LogOut className="h-5 w-5 mr-2" />
                    Account Actions
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Download Your Data
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="new-quiz" className="text-base">
                          New Quizzes
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications when new quizzes are available
                        </p>
                      </div>
                      <Switch id="new-quiz" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="quiz-results" className="text-base">
                          Quiz Results
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications when your quiz results are ready
                        </p>
                      </div>
                      <Switch id="quiz-results" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="leaderboard" className="text-base">
                          Leaderboard Updates
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications when you move up in the leaderboard
                        </p>
                      </div>
                      <Switch id="leaderboard" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="achievements" className="text-base">
                          Achievements
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications when you earn new achievements
                        </p>
                      </div>
                      <Switch id="achievements" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing" className="text-base">
                          Marketing
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive marketing emails and special offers
                        </p>
                      </div>
                      <Switch id="marketing" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Frequency</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="immediate"
                        name="frequency"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                        defaultChecked
                      />
                      <Label htmlFor="immediate">Immediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="daily"
                        name="frequency"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <Label htmlFor="daily">Daily Digest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="weekly"
                        name="frequency"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <Label htmlFor="weekly">Weekly Digest</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
