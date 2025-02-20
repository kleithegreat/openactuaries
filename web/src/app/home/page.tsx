import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Search, BookOpen, ExternalLink, BarChart } from 'lucide-react';
import Link from 'next/link';
import { getRequiredServerSession } from '@/lib/auth/server';

export default async function HomePage() {
  const session = await getRequiredServerSession();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{session.user?.name ? `, ${session.user.name}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">
            Ready to continue your exam preparation journey?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 auto-rows-fr">
          <Link href="/guided-practice" className="block h-full">
            <Card className="hover:shadow-lg bg-background transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-sky-900" />
                  Recommended Practice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get personalized practice problems based on your progress and areas for improvement.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/questions" className="block h-full">
            <Card className="hover:shadow-lg bg-background transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-sky-900" />
                  Browse All Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Explore our complete question bank and practice specific topics.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Study Progress Overview */}
        <Card className="mb-8 bg-background">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Study Progress</CardTitle>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="gap-2">
                <BarChart className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
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
        <Card className="bg-background">
          <CardHeader className="flex flex-row items-center justify-between ">
            <CardTitle>Recommended Topics</CardTitle>
            <Link href="/wiki">
              <Button variant="ghost" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Exam Wiki
              </Button>
            </Link>
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
}