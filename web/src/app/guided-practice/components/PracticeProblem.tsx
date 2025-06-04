import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Clock } from 'lucide-react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Problem } from '../types';

interface PracticeProblemProps {
  problem: Problem;
  onAnswer: (
    problemId: string,
    answer: string,
    isCorrect: boolean,
    timeSpent: number,
  ) => void;
}

export default function PracticeProblem({
  problem,
  onAnswer,
}: PracticeProblemProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [serializedContent, setSerializedContent] =
    useState<MDXRemoteSerializeResult | null>(null);
  const [serializedChoices, setSerializedChoices] = useState<
    MDXRemoteSerializeResult[]
  >([]);
  const [serializedExplanation, setSerializedExplanation] =
    useState<MDXRemoteSerializeResult | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    async function serializeProblem() {
      const [serializedStatement, serializedExp] = await Promise.all([
        serialize(problem.statement, {
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [rehypeKatex],
          },
        }),
        serialize(problem.explanation, {
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [rehypeKatex],
          },
        }),
      ]);

      setSerializedContent(serializedStatement);
      setSerializedExplanation(serializedExp);

      const serializedChoicesPromises = problem.choices.map(choice =>
        serialize(choice.content, {
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [rehypeKatex],
          },
        }),
      );
      const choicesContent = await Promise.all(serializedChoicesPromises);
      setSerializedChoices(choicesContent);
    }

    if (problem) {
      serializeProblem();
      setStartTime(Date.now());
      setSelectedAnswer('');
      setIsChecked(false);
    }
  }, [problem]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleAnswerSelect = (answer: string) => {
    if (!isChecked) {
      setSelectedAnswer(answer);
    }
  };

  const checkAnswer = () => {
    setIsChecked(true);
    const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    setTimeSpent(finalTimeSpent);
  };

  const moveToNext = () => {
    onAnswer(
      problem.id,
      selectedAnswer,
      selectedAnswer === problem.correctAnswer,
      timeSpent,
    );
  };

  if (!problem || !serializedContent) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCorrect = selectedAnswer === problem.correctAnswer;

  return (
    <Card className="bg-background-highlight border-border">
      <CardHeader className="border-b border-border flex flex-row justify-between items-center">
        <CardTitle className="text-foreground font-serif">
          Question {problem.questionNumber}
        </CardTitle>
        <div className="flex items-center gap-2 text-foreground-secondary">
          <Clock className="h-4 w-4" />
          <span>{formatTime(timeSpent)}</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="w-1/2">
            <div className="prose max-w-none text-foreground font-serif">
              {serializedContent && <MDXRemote {...serializedContent} />}
            </div>
          </div>

          <div className="w-1/2 space-y-3">
            {problem.choices.map((choice, index) => (
              <button
                key={choice.letter}
                onClick={() => handleAnswerSelect(choice.letter)}
                disabled={isChecked}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  selectedAnswer === choice.letter
                    ? 'bg-primary/10 border-primary text-foreground'
                    : 'border-border hover:bg-background-secondary text-foreground'
                }`}
              >
                <div className="flex">
                  <span className="font-medium font-serif mr-2 min-w-[1.5rem]">
                    {choice.letter})
                  </span>
                  <div className="flex-1 font-serif">
                    {serializedChoices[index] && (
                      <MDXRemote {...serializedChoices[index]} />
                    )}
                  </div>
                </div>
              </button>
            ))}

            {isChecked && (
              <Alert
                variant={isCorrect ? 'success' : 'destructive'}
                className={`
                  ${
                    isCorrect
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {isCorrect
                      ? 'Correct!'
                      : `Incorrect. The correct answer is ${problem.correctAnswer}.`}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="mt-4">
              {!isChecked ? (
                <Button
                  onClick={checkAnswer}
                  disabled={!selectedAnswer}
                  className="w-full"
                >
                  Check Answer
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        View Explanation
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="bg-background-highlight">
                      <div className="mx-auto w-full max-w-4xl">
                        <DrawerHeader className="border-b border-border">
                          <DrawerTitle className="text-foreground font-serif">
                            Explanation
                          </DrawerTitle>
                        </DrawerHeader>
                        <div className="p-6 prose max-w-none h-[500px] overflow-auto text-foreground font-serif [&_.math]:font-sans">
                          {serializedExplanation && (
                            <MDXRemote {...serializedExplanation} />
                          )}
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>

                  <Button onClick={moveToNext} className="flex-1">
                    Next Problem
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
