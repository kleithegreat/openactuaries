'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function PracticeExamDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState('');

  const handleTriggerClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      const examTypes =
        data.examRegistrations?.map(
          (reg: { examType: string }) => reg.examType,
        ) || [];

      if (examTypes.length === 0) {
        router.push('/setup');
        return;
      }

      if (examTypes.length === 1) {
        router.push(
          `/guided-practice?exam=${encodeURIComponent(examTypes[0])}`,
        );
        return;
      }

      setExams(examTypes);
      setOpen(true);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => {
    if (!selectedExam) return;
    router.push(`/guided-practice?exam=${encodeURIComponent(selectedExam)}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span onClick={handleTriggerClick} className="contents">
          {children}
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Which exam would you like to study for?</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map(exam => (
                  <SelectItem key={exam} value={exam}>
                    Exam {exam}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={startPractice}
              disabled={!selectedExam}
              className="w-full"
            >
              Start Practice
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
