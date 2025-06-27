import React from 'react';

export const metadata = {
  title: 'Commander - Easy Order',
  description: 'Commandez facilement depuis votre table',
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-xl">Easy Order</div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-white/20 rounded-md hover:bg-white/30 transition-colors">
              Panier
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Easy Order. Tous droits réservés.</p>
          <p className="text-sm mt-2">Pour assistance, veuillez appeler un serveur.</p>
        </div>
      </footer>
    </div>
  );
} 