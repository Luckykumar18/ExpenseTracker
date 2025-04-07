// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { fetchUserProfile } from "../api/auth";

const Profile: React.FC<{ signOut: () => void }> = ({ signOut }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await fetchUserProfile();
        if (response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    getProfile();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Use placeholders if financial summary fields are missing
  const totalExpenses = user.totalExpenses ?? "$0.00";
  const totalIncome = user.totalIncome ?? "$0.00";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gradient">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24 mx-auto border-2 border-blue-500/50">
                  <AvatarImage src={user.profileImage || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl mb-1">
                {user.username || user.email}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full glass-card flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full glass-card flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full flex items-center gap-2" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.username || user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl">Financial Summary</CardTitle>
              <CardDescription>Your expense tracking statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="metric-card">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="font-bold text-2xl text-gradient">{totalExpenses}</p>
                </div>
                <div className="metric-card">
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="font-bold text-2xl text-gradient">{totalIncome}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-center">
                  Connect your account to view your financial statistics and personalize your experience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
