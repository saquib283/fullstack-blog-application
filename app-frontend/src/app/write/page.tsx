"use client"
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BlogEditor = dynamic(() => import('@/app-components/BlogEditor'), {
  ssr: false,
});


export default function WritePage() {
  const { user, logout, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && (!user || !user.username)) {
      router.push("/");
    }
  })

  return (
    <main className="pt-10">
      {

        user && user.username ? (
          <BlogEditor />
        ) : (
          <div className='w-full h-screen flex justify-center items-center'>
            <h1 className='font-roboto'>You are not allowed to write</h1>
          </div>
        )

      }

    </main>
  );
}
