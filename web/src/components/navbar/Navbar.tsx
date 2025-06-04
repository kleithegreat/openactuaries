'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { User } from 'next-auth';

interface NavbarProps {
  user: User | null | undefined;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/profile');
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await res.json();
        setIsNewUser(
          !data.goalType &&
            !data.goalAmount &&
            (!data.examRegistrations || data.examRegistrations.length === 0),
        );
      } catch (err) {
        console.error('Error fetching profile:', err);
        setIsNewUser(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const getLinkDestination = () => {
    if (!user) return '/';
    if (isNewUser) return '/';
    if (pathname === '/home') return '/';
    return '/home';
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href={getLinkDestination()} className="flex items-center">
              <span
                className="text-xl font-bold shiny-text font-logo"
                onMouseMove={handleMouseMove}
                style={
                  {
                    '--mouse-x': `${mousePosition.x}px`,
                    '--mouse-y': `${mousePosition.y}px`,
                    color: '#000000',
                  } as React.CSSProperties
                }
              >
                open/actuaries
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="animate-pulse text-foreground-secondary">
                Loading...
              </div>
            ) : user ? (
              <>
                <span className="text-foreground-secondary">
                  Signed in as{' '}
                  <strong className="text-foreground">
                    {user.name || user.email || 'User'}
                  </strong>
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-foreground"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/setup">My Info</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-foreground hover:bg-foreground/5"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
