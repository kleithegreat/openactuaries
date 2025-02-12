import React from 'react';
import { Github, BookOpen, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { getServerSessionUser } from '@/lib/auth/server';
import { StartPracticingButton } from '@/components/landing/StartPracticingButton';

export default async function LandingPage() {
  const user = await getServerSessionUser();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-16 pb-8 sm:pt-24 sm:pb-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-6">
                Ace Your Actuarial Exams
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-8">
                Personalized practice problems for <strong>P</strong>, <strong>FM</strong>, and more coming soon. Absolutely no strings attached, because exam prep shouldn&apos;t cost a fortune.
              </p>
              <div className="flex justify-center gap-4">
                <StartPracticingButton user={user} />
                <a 
                  href="https://github.com/kleithegreat/openactuaries" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="gap-2 border-sky-900 text-sky-900 hover:bg-sky-50">
                    <Github className="h-5 w-5" />
                    View Source
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <BookOpen className="h-12 w-12 text-sky-900 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Quality Content</h3>
                  <p className="text-gray-600">
                    Practice problems pulled straight from official SOA materials
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Target className="h-12 w-12 text-sky-900 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Exam-Style Format</h3>
                  <p className="text-gray-600">
                    Questions match the style and difficulty of real exam problems
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Sparkles className="h-12 w-12 text-sky-900 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Personalized Prep</h3>
                  <p className="text-gray-600">
                    Get problems tailored to your strengths and weaknesses
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-16 bg-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-sky-900 mb-2">700+</div>
              <div className="text-gray-600">Problems</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-900 mb-2">2</div>
              <div className="text-gray-600">Exams supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-900 mb-2">100%</div>
              <div className="text-gray-600">Free Forever</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-sky-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center gap-4">
            <a 
              href="https://github.com/kleithegreat/openactuaries" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
            >
              <Github className="h-6 w-6" />
            </a>
            <span className="text-gray-400">|</span>
            <Link href="/about" className="text-gray-400 hover:text-white">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}