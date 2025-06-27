'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isLoggedIn, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        // Rediriger vers la page de connexion si non connecté
        router.push('/login');
      } else if (adminOnly && user && !user.isAdmin) {
        // Rediriger vers la page d'accueil si l'utilisateur n'est pas administrateur
        router.push('/');
      }
    }
  }, [isLoggedIn, loading, router, adminOnly, user]);

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si l'utilisateur est connecté et a les droits requis, afficher le contenu protégé
  if (isLoggedIn && (!adminOnly || (user && user.isAdmin))) {
    return <>{children}</>;
  }

  // Ne rien afficher pendant la redirection
  return null;
} 