import {currentUserRole} from "@/modules/auth/actions";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "@/lib/judge0";
export async function POST(request) {
    try {
        const userRole = await currentUserRole();
        const user = await getCurrentUser();
            if (userRole !== "ADMIN") {
                return NextResponse.json({error:"Unauthorized"}, { status: 401 });
            }
            const body = await request.json();
            const {
                title,
                description,
                difficulty,
                category,
                tags,
                solution,
                testCases,
                codeSnippets,
                refrenceSolution,
            } = body;
            if(!title || !description || !difficulty || !category || !tags || !solution || !testCases){
                return NextResponse.json(
                    {error:"Missing required fields"},
                    { status: 400 }
                );
            }
            if (!Array.isArray(testCases)|| testCases.length === 0){
                return NextResponse.json(
                    {error:"Test cases must be a non-empty array"},
                    { status: 400 }
                );
            }
            if (refrenceSolution && typeof refrenceSolution !== "object"){
                return NextResponse.json(
                    {error:"Reference solutions must be an object"},
                    { status: 400 }
                );
            }
            const problem = await prisma.problem.create({
                data: {
                    title,
                    description,
                    difficulty,
                    category,
                    tags,
                    solution,
                    testCases,
                },
            });
            
            if (refrenceSolution) {
                for (const [language, solutionCode] of Object.entries(refrenceSolution || {})){
                    const languageId = getJudge0LanguageId(language);
                    if(!languageId){
                        return NextResponse.json({error:`Unsupported language: ${language}`}, { status: 400 });  
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
                            return NextResponse.json({
                                error:`Reference solution failed on test case ${i+1}`,
                                testCase: {
                                    input: submissions[i].stdin,
                                    expectedOutput: submissions[i].expectedOutput,
                                    actualOutput: result.stdout,
                                    error: result.stderr || result.compile_output,
                                }
                            }, { status: 400 });
                        }
                    }
                }
            }
            
            return NextResponse.json({success:true, message:"Problem created successfully", data:problem}, { status: 200 });
    } catch(error) {
        console.error("Error creating problem:", error);
        return NextResponse.json({error:"Failed to create problem"}, { status: 500 });
    }
}
