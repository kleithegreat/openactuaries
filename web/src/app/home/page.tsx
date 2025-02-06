'use client'

import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Welcome back, {session.user?.name || session.user?.email}
      </h1>
    </div>
  );
};

export default HomePage;