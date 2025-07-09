import React from "react";
import NavBar from "../_components/navbar";
import { currentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Shield } from "lucide-react";
import { MynaHero } from "@/components/home/hero";
import { ExtendedUser } from "@/schemas";

const Home = async () => {
  const user = (await currentUser()) as ExtendedUser;
  // console.log(user)
  return (
    <div className="min-h-screen bg-background">
   
      
      {/* <main className="flex justify-center items-center text-center min-h-screen">
        Home Page
      </main> */}
         <NavBar user={user} />
      {/* <MynaHero user={user} /> */}
    </div>
  );
};

export default Home;