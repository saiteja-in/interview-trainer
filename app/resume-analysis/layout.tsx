"use client";

import NavBar from "../_components/navbar";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
   <div>
    <NavBar/>
    {children}
   </div>
  );
};

export default AuthLayout;
