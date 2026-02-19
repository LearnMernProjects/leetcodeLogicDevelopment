"use server"
import {db} from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { currentUserRole } from "@/lib/session";
export const getAllProblems = async ()=>{
    try{
        const user = await currentUser();
        const data = await db.user.findUnique({
            where:{
                clerkId:user?.id
            },
            select:{
                id:true,
            }
            }
        )
        const problems = await db.problem.findMany({
            orderBy:{
                createdAt:"desc"
            },
        });
        return{success:true, data:problems};
    }catch(error){
        console.error("Error fetching problems:", error);
        return {success:false, error:"Failed to fetch problems"
            }
    }
}
export const emById = async (Id)=>{
    try{
        const problem = await db.problem.findUnique({
            where:{
                id:Id
            }
        })
        return {success:true, data:problem};
    }catch(error){
        console.error("Error fetching problem by ID:", error);
        return {success:false, error:"Failed to fetch problem by ID"};
    }

    export const deleteProblem = async(problemId)=>{
        try{
            const user = await currentUser();
            if(!user){
                throw new Error("Unauthorized");
            }
            if (currentUserRole() !== "ADMIN"){
                throw new Error("Forbidden only admins can delete problems");

            }
            await db.problem.delete({
                where:{
                    id:problemId
                }
            });
            revalidatePath("/problems");
            return {success:true, message:"Problem deleted successfully"};
        }catch(error){
console.error("Error deleting problem:", error);
return {success:false, error:"Failed to delete problem"};
        }
            }