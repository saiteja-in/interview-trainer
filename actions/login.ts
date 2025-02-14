"use server";
import * as z from "zod";
import { AuthError } from "next-auth";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateVerificationToken } from "@/lib/tokens";
import { getUserByEmail } from "./user";
import { sendVerificationEmail } from "@/lib/mail";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobRole } from "@prisma/client";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }
  const { email, password } = validatedFields.data;
  const existingUser=await getUserByEmail(email);
  if(!existingUser || !existingUser.email || !existingUser.password){
    return {error:"Email does not exist!"}
  }
  if(!existingUser.emailVerified){
    const verificationToken=await generateVerificationToken(existingUser.email)
    await sendVerificationEmail(verificationToken.email,verificationToken.token)
    return {success:"Confirmation email sent!"}
  };
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
  return { success: "Email sent" };
};



export const updateUserRole = async(role:string)=>{
  try{
    const user = await currentUser();
    if(!user){
      throw new Error('Unauthorized');
    }
    const updatedUser= await db.user.update({
      where:{id:user.id},
      data:{
       jobRole: role as JobRole
      }
    })
    return updatedUser;
  }catch(error){
    console.error('Error updating user role:', error)
    throw new Error('Failed to update user role')
  }
}