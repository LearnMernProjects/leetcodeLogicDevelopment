"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Send,
  Code,
  FileText,
  Lightbulb,
  Trophy,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";

import { getJudge0LanguageId } from "@/lib/judge0";
import { toast } from "sonner";
import Link from "next/link";
import { executeCode, getAllSubmissionByCurrentUserForProblem, getProblemById } from "@/modules/problems/actions";

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "EASY":
      return "bg-green-100 text-green-800 border-green-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "HARD":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const ProblemIdPage = ({ params }) => {
  const [problem, setProblem] = useState(null);
  const [problemError, setProblemError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [executionResponse, setExecutionResponse] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setIsLoading(true);
        setProblemError(null);
        const resolvedParams = await params;
        const problemData = await getProblemById(resolvedParams.id);
        if (problemData.success && problemData.data) {
          console.log(problemData.data);
          setProblem(problemData.data);
          setCode(problemData.data.codeSnippets?.[selectedLanguage] || "");
        } else {
          setProblemError(problemData.error || "Problem not found");
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
        setProblemError("Failed to load problem");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [params]);

    useEffect(()=>{
    const fetchSubmissionHistory = async()=>{
      try {
        const resolvedParams = await params;
        const submissionHistory = await getAllSubmissionByCurrentUserForProblem(resolvedParams.id);
        console.log(submissionHistory);
        if (submissionHistory.success) {
          setSubmissionHistory(submissionHistory.data);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    }

    fetchSubmissionHistory();
  },[params])  


  useEffect(() => {
    if (problem && problem.codeSnippets[selectedLanguage]) {
      setCode(problem.codeSnippets[selectedLanguage]);
    }
  }, [selectedLanguage, problem]);

  const handleRun = async () => {
    try {
      setIsRunning(true);
      const language_id = getJudge0LanguageId(selectedLanguage);
      const stdin = problem.testCases.map((tc) => tc.input);
      const expected_outputs = problem.testCases.map((tc) => tc.output);
      const res = await executeCode(
        code,
        language_id,
        stdin,
        expected_outputs,
        problem.id
      );

      setExecutionResponse(res);
      if (res.success) {
        toast.success(res.message);
      }
    } catch (error) {
      console.error("Error running code:", error);
      toast.error(error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {};

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin size-5 text-amber-400" />
      </div>
    );
  }

  if (problemError || !problem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Problem Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {problemError || "The problem you're looking for doesn't exist."}
          </p>
          <Link href="/problems">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to Problems
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{problem?.title}</h1>
              <Badge
                className={cn(
                  "font-medium",
                  getDifficultyColor(problem?.difficulty)
                )}
              >
                {problem?.difficulty}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {problem?.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <ModeToggle />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Problem Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-foreground leading-relaxed">
                    {problem?.description}
                  </p>

                  {/* Examples */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Example:</h3>
                    {problem?.examples[selectedLanguage] && (
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div>
                          <span className="font-medium text-amber-400">
                            Input:{" "}
                          </span>
                          <code className="text-sm dark:bg-zinc-900 bg-zinc-200 text-zinc-900 dark:text-zinc-200 px-2 py-1 rounded">
                            {problem?.examples[selectedLanguage].input}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium text-amber-400">
                            Output:{" "}
                          </span>
                          <code className="text-sm dark:bg-zinc-900 bg-zinc-200 text-zinc-900 dark:text-zinc-200 px-2 py-1 rounded">
                            {problem?.examples[selectedLanguage].output}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Explanation: </span>
                          <span className="text-sm">
                            {problem?.examples[selectedLanguage]?.explanation}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Constraints */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Constraints:</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {problem?.constraints}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <Tabs defaultValue="submissions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="submissions"
                      className="flex items-center gap-2"
                    >
                      <Trophy className="h-4 w-4" />
                      Submissions
                    </TabsTrigger>
                    <TabsTrigger
                      value="editorial"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Editorial
                    </TabsTrigger>
                    <TabsTrigger
                      value="hints"
                      className="flex items-center gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      Hints
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="submissions" className="p-6">
                    <div className="space-y-4">
                      {submissionHistory && submissionHistory.length > 0 ? (
                        submissionHistory.map((submission, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <p className="font-semibold">Submission #{index + 1}</p>
                                <p className="text-sm text-muted-foreground">Language: {submission.language}</p>
                                <p className="text-sm text-muted-foreground">Status: {submission.status}</p>
                              </div>
                              <Badge variant={submission.status === 'Accepted' ? 'default' : 'destructive'}>
                                {submission.status}
                              </Badge>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center py-8 text-muted-foreground">No submissions yet</p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="editorial" className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      {problem.editorial
                        ? problem.editorial
                        : "Editorial not available yet."}
                    </div>
                  </TabsContent>
                  <TabsContent value="hints" className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      {problem.hints
                        ? problem.hints
                        : "No hints available for this problem."}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Code Editor
                  </CardTitle>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                      <SelectItem value="PYTHON">Python</SelectItem>
                      <SelectItem value="JAVA">Java</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    language={
                      selectedLanguage.toLowerCase() === "javascript"
                        ? "javascript"
                        : selectedLanguage.toLowerCase()
                    }
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 16,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: "on",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleRun}
                    disabled={isRunning}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {isRunning ? "Running..." : "Run"}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Cases</CardTitle>
                <CardDescription>
                  Run your code against these test cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-4">
                    {problem.testCases.map((testCase, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="text-sm font-medium mb-2">
                          Test Case {index + 1}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Input:{" "}
                            </span>
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {testCase.input}
                            </code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Expected:{" "}
                            </span>
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {testCase.output}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

 {/* Test Results and Submission Details */}
            {executionResponse && executionResponse.submission && (
              <Card>
                <CardHeader>
                  <CardTitle>Execution Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={executionResponse.submission.status === 'Accepted' ? 'default' : 'destructive'}>
                        {executionResponse.submission.status}
                      </Badge>
                    </div>
                    {executionResponse.submission.executionTime && (
                      <div>
                        <p className="text-sm text-muted-foreground">Execution Time</p>
                        <p className="font-semibold">{executionResponse.submission.executionTime}ms</p>
                      </div>
                    )}
                    {executionResponse.submission.memoryUsage && (
                      <div>
                        <p className="text-sm text-muted-foreground">Memory Usage</p>
                        <p className="font-semibold">{executionResponse.submission.memoryUsage}MB</p>
                      </div>
                    )}
                  </div>

                  {/* Test Cases Results */}
                  {executionResponse.submission.testCases && executionResponse.submission.testCases.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-3">Test Case Results</h4>
                      <div className="space-y-2">
                        {executionResponse.submission.testCases.map((testCase, index) => (
                          <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                            <span className="text-sm font-medium">Test Case {index + 1}</span>
                            <div className="flex items-center gap-3">
                              {testCase.output && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">Output: </span>
                                  <code className="bg-muted px-2 py-1 rounded">{testCase.output}</code>
                                </div>
                              )}
                              <Badge 
                                variant={testCase.status === 'Accepted' || testCase.passed ? 'default' : 'destructive'}
                                className="whitespace-nowrap"
                              >
                                {testCase.status || (testCase.passed ? 'Passed' : 'Failed')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemIdPage;