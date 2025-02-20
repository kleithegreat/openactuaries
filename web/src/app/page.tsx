import React from 'react';
import { Github, BookOpen, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getServerSessionUser } from '@/lib/auth/server';
import { StartPracticingButton } from '@/components/landing/StartPracticingButton';

export default async function LandingPage() {
  const user = await getServerSessionUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 sm:pt-28 sm:pb-24">
            <div className="text-center">
              <h1 className="text-4xl font-serif font-bold text-foreground sm:text-5xl lg:text-6xl mb-6">
                Ace Your <span className="text-primary">Actuarial</span> Exams
              </h1>
              <p className="text-lg text-foreground-secondary mb-12 leading-relaxed">
                Personalized practice problems for <strong className="text-foreground">P</strong>, <strong className="text-foreground">FM</strong>, and more coming soon. 
                <span className="block mt-2">Absolutely no strings attached, because exam prep shouldn&apos;t cost a fortune.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <StartPracticingButton user={user} />
                <a 
                  href="https://github.com/kleithegreat/openactuaries" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2 border-primary text-primary hover:bg-primary/5 w-full sm:w-auto"
                  >
                    <Github className="h-5 w-5" />
                    View Source
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-background-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 p-3 rounded-full bg-primary/10">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Quality Content</h3>
              <p className="text-foreground-secondary">
                Practice problems pulled straight from official SOA materials
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 p-3 rounded-full bg-primary/10">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Exam-Style Format</h3>
              <p className="text-foreground-secondary">
                Questions match the style and difficulty of real exam problems
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 p-3 rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Personalized Prep</h3>
              <p className="text-foreground-secondary">
                Get problems tailored to your strengths and weaknesses
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 border-t border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-serif font-bold text-primary mb-2">700+</div>
              <div className="text-foreground-secondary">Problems</div>
            </div>
            
            <div>
              <div className="text-5xl font-serif font-bold text-primary mb-2">2</div>
              <div className="text-foreground-secondary">Exams Supported</div>
            </div>
            
            <div>
              <div className="text-5xl font-serif font-bold text-primary mb-2">100%</div>
              <div className="text-foreground-secondary">Free Forever</div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <Github className="h-8 w-8 text-foreground mr-3" />
            <span className="h-6 w-px bg-border"></span>
            <span className="ml-3 font-mono text-sm bg-foreground/5 px-3 py-1 rounded text-foreground-secondary">open-source</span>
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-4">A free, open-source platform</h2>
          <p className="text-foreground-secondary mb-8">
            open/actuaries aims to make actuarial education accessible to everyone.
            Created as a personal project to help fellow actuarial students, 
            it&apos;s now available for everyone to use and contribute to.
          </p>
          <a 
            href="https://github.com/kleithegreat/openactuaries"
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <span className="mr-2">View project on GitHub</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
        </div>
      </div>

      <footer className="bg-primary py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <span className="text-foreground-inverted/90 text-sm">
              MIT Licensed
            </span>
            <a 
              href="https://github.com/kleithegreat/openactuaries" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground-inverted/90 hover:text-foreground-inverted flex items-center gap-2"
            >
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}