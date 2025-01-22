"use server";

import { signOut } from "@/auth";

export const logout = async () => {
  await signOut({ redirectTo: "/auth/login" });
  // document.cookie = "authjs.csrf-token=; Max-Age=0; path=/;";
  // document.cookie = "authjs.callback-url=; Max-Age=0; path=/;";
};
