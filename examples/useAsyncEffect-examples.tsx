import React, { useState } from 'react';
import { useAsyncEffect } from '@/hooks/useAsyncEffect';

interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
}

// Ví dụ 1: Fetch data cơ bản
export function BasicExample() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useAsyncEffect(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// Ví dụ 2: Với dependencies
export function WithDependencies() {
  const [userId, setUserId] = useState(1);
  const [user, setUser] = useState<User | null>(null);

  useAsyncEffect(async () => {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    setUser(data);
  }, [userId]); // Re-run khi userId thay đổi

  return (
    <div>
      <button onClick={() => setUserId(prev => prev + 1)}>
        Next User
      </button>
      {user && <div>{user.name}</div>}
    </div>
  );
}

// Ví dụ 3: Với cleanup function
export function WithCleanup() {
  const [data, setData] = useState<any>(null);

  useAsyncEffect(async () => {
    const controller = new AbortController();
    
    try {
      const response = await fetch('/api/data', {
        signal: controller.signal
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error:', error);
      }
    }
    
    // Return cleanup function
    return () => {
      controller.abort();
    };
  }, []);

  return <div>{data && <pre>{JSON.stringify(data, null, 2)}</pre>}</div>;
}

// Ví dụ 4: Với error handling
export function WithErrorHandling() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useAsyncEffect(async () => {
    try {
      setError(null);
      const response = await fetch('/api/data');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error:', error);
    }
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}

// Ví dụ 5: Với multiple async operations
export function MultipleAsyncOperations() {
  const [userData, setUserData] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useAsyncEffect(async () => {
    try {
      // Chạy song song nhiều async operations
      const [userResponse, postsResponse] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/posts')
      ]);
      
      const [user, postsData] = await Promise.all([
        userResponse.json(),
        postsResponse.json()
      ]);
      
      setUserData(user);
      setPosts(postsData);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  return (
    <div>
      {userData && <h2>{userData.name}</h2>}
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
} 