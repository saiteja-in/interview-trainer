// import { auth, signOut } from "@/auth";
// import { Button } from "@/components/ui/button";
// import React from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// const page = async () => {
//   const session = await auth();
//   console.log(session);
//   return (
//     <div className="items-center justify-center min-h-screen">
//       <div className="flex flex-col gap-3">
//         <p>Role: {session?.user?.role}</p>
//         <p>Email: {session?.user?.email}</p>
//         <p>Name: {session?.user?.name}</p>
//         <p>OAuth: {session?.user?.isOAuth}</p>
//         <p>Image: {session?.user?.image}</p>
//         <Avatar>
//           {session?.user?.image ? (
//             <AvatarImage src={session.user.image} />
//           ) : (
//             <AvatarFallback>
//               {session?.user?.name?.substring(0, 2).toUpperCase() ?? "AA"}
//             </AvatarFallback>
//           )}
//         </Avatar>
//       </div>
//       <form
//         action={async () => {
//           "use server";
//           await signOut({ redirectTo: "/auth/login" });
//         }}
//       >
//         <Button type="submit">Sign out</Button>
//       </form>
//     </div>
//   );
// };

// export default page;


// "use client"
// import { logout } from "@/actions/logout";
// import { useCurrentUser } from "@/hooks/use-current-user";
// const SettingsClientPage=()=>{
//   const user=useCurrentUser()
//   console.log(user)
//   const onClick=()=>{
//     logout()
//   }
//   return (
//     <div>
//       {JSON.stringify(user)}
//       <button onClick={onClick} type="submit">Sign Out</button>
//     </div>
//   )
// }
// export default SettingsClientPage



"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useSession } from "next-auth/react";
import { ExtendedUser, SettingsSchema } from "@/schemas";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { settings } from "@/actions/settings";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from "nextjs-toploader/app";
interface SettingsPageProps {
  user: ExtendedUser | undefined;
}
const SettingsPage :React.FC<SettingsPageProps> = ({ user })=> {

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      name: user?.name || undefined,
      email: user?.email || undefined,
      role: user?.role || undefined,
    }
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }

          if (data.success) {
            update();
            setSuccess(data.success);
            
          }
        })
        .catch(() => setError("Something went wrong!"));
    });
  }

  return ( 
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">
           Profile
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            className="space-y-6" 
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user?.isOAuth === false && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="john.doe@example.com"
                            type="email"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="******"
                            type="password"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="******"
                            type="password"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {/* <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>
                          Admin
                        </SelectItem>
                        <SelectItem value={UserRole.USER}>
                          User
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button
              disabled={isPending}
              type="submit"
            >
              {isPending ?<FaSpinner size={"20"} className="animate-spin"/>:<p> Save</p>}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
   );
}
 
export default SettingsPage;