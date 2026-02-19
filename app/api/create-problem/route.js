import {currentUserRole} from "@/modules/auth/actions";
import { ensureUserInDatabase } from "@/modules/auth/actions";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "@/lib/judge0";

export async function POST(request) {
    try {
        console.log("=== Creating problem ===");
        
        // Get Clerk user first
        const clerkUser = await currentUser();
        console.log("Clerk user:", clerkUser?.id);
        
        if (!clerkUser) {
            return NextResponse.json({error:"Not authenticated"}, { status: 401 });
        }
        
        // Ensure user is in database
        const dbUser = await ensureUserInDatabase();
        console.log("DB user:", dbUser);
        
        if (!dbUser) {
            return NextResponse.json({error:"Could not sync user to database"}, { status: 404});
        }
        
        // Check if admin
        const userRole = await currentUserRole();
        console.log("User role:", userRole);
        
        if (userRole !== "ADMIN") {
            return NextResponse.json({error:"Only admins can create problems"}, { status: 401 });
        }
        
        const body = await request.json();
        console.log("Request body keys:", Object.keys(body));
        
        const {
            title,
            description,
            difficulty,
            tags,
            constraints,
            hints,
            editorial,
            testCases,
            examples,
            codeSnippets,
            referenceSolutions,
        } = body;
        
        if(!title || !description || !difficulty || !tags || !testCases){
            console.log("Missing fields");
            return NextResponse.json(
                {error:"Missing required fields"},
                { status: 400 }
            );
        }
        
        if (!Array.isArray(testCases)|| testCases.length === 0){
            console.log("Invalid test cases");
            return NextResponse.json(
                {error:"Test cases must be a non-empty array"},
                { status: 400 }
            );
        }
        
        console.log("Creating problem...");
        const problem = await db.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags: Array.isArray(tags) ? tags : tags.split(","),
                constraints,
                hints,
                editorial,
                testCases,
                examples,
                codeSnippets,
                referenceSolutions: referenceSolutions,
                userId: dbUser.id,
            },
        });
        
        console.log("Problem created:", problem.id);
        
        // Validate reference solutions with Judge0 (non-blocking)
        if (referenceSolutions && process.env.JUDGE0_API_URL) {
            try {
                for (const [language, solutionCode] of Object.entries(referenceSolutions || {})){
                    const languageId = getJudge0LanguageId(language);
                    if(!languageId){
                        console.warn(`Unsupported language: ${language}`);
                        continue;
                    }
                    
                    const submissions = testCases.map((testCase) => ({
                        problemId: problem.id,
                        languageId,
                        sourceCode: solutionCode,
                        stdin: testCase.input,
                        expectedOutput: testCase.output,
                    }));
                    
                    const submissionResult = await submitBatch(submissions);
                    const tokens = submissionResult.data.map(res => res.token);
                    const results = await pollBatchResults(tokens);
                    
                    for (let i=0; i<results.length; i++){
                        const result = results[i];
                        if(result.status.id !== 3){
                            console.warn(`Reference solution validation failed on test case ${i+1} for ${language}`);
                        }
                    }
                }
            } catch(validationError) {
                console.warn("Judge0 validation skipped:", validationError.message);
                // Don't fail the request if Judge0 validation fails
            }
        }
        
        return NextResponse.json({success:true, message:"Problem created successfully", data:problem}, { status: 200 });
    } catch(error) {
        console.error("Error creating problem:", error);
        return NextResponse.json({error:"Failed to create problem", details: error.message}, { status: 500 });
    }
}
