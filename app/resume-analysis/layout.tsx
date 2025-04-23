import { currentUser } from "@/lib/auth";
import NavBar from "../_components/navbar";
import { ExtendedUser } from "@/schemas";

const AuthLayout =async ({ children }: { children: React.ReactNode }) => {
   const user = (await currentUser()) as ExtendedUser;
  return (
   <div>
    <NavBar user={user} />
    {children}
   </div>
  );
};

export default AuthLayout;
