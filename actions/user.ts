// "use server"
// import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
// import { JobRole } from "@prisma/client";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

// export const updateUserRole = async(role:string)=>{
//   try{
//     const user = await currentUser();
//     if(!user){
//       throw new Error('Unauthorized');
//     }
//     const updatedUser= await db.user.update({
//       where:{id:user.id},
//       data:{
//        jobRole: role as JobRole
//       }
//     })
//     return updatedUser;
//   }catch(error){
//     console.error('Error updating user role:', error)
//     throw new Error('Failed to update user role')
//   }
// }