'use client'

import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Clock, History } from 'lucide-react';
import Link from 'next/link';

const HomePage = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Ready to continue your exam preparation journey?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-sky-900" />
                Quick Practice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Jump right into practice problems tailored to your current progress.
              </p>
              <Link href="/questions">
                <Button className="w-full bg-sky-900 hover:bg-sky-800">
                  Start Practice
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-900" />
                Timed Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Test yourself under exam-like conditions with timed practice sessions.
              </p>
              <Link href="/quiz">
                <Button className="w-full bg-sky-900 hover:bg-sky-800">
                  Start Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-sky-900" />
                Resume Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Continue where you left off in your last study session.
              </p>
              <Link href="/history">
                <Button className="w-full bg-sky-900 hover:bg-sky-800">
                  View History
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Study Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Study Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-sky-900">127</div>
                <div className="text-gray-600">Problems Solved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sky-900">4</div>
                <div className="text-gray-600">Hours Studied</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sky-900">82%</div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                Probability Distributions
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                Interest Rate Theory
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                Time Value of Money
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                Risk Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;