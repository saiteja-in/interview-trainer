import React from "react";
import NavBar from "../_components/navbar";
import { currentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Shield } from "lucide-react";

const Home = async () => {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-200">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border dark:border-gray-800 dark:bg-black">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              User Profile
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col items-center space-y-8">
              {/* User Avatar */}
              <div className="relative group">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white dark:border-gray-800 shadow-lg">
                  {user?.image ? (
                    <AvatarImage 
                      src={user.image} 
                      alt={user?.name || 'User'} 
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-100  dark:bg-gray-700 text-2xl md:text-3xl ">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              {/* User Details */}
              <div className="w-full space-y-4">
                {/* Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-full">
                      <User className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user?.name || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-full">
                      <Mail className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-white break-all">
                        {user?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-full">
                      <Shield className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user?.role || 'Not assigned'}
                        </p>
                        <Badge variant="secondary" className="capitalize bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                          {user?.role || 'user'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;