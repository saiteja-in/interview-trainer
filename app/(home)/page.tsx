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
      
      <main className="flex justify-center items-center text-center min-h-screen">
        Home Page
      </main>
    </div>
  );
};

export default Home;