'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId');
  const tableName = searchParams.get('tableName');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement pour vérifier que les paramètres sont présents
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Vérifier si les paramètres nécessaires sont présents
  if (!tableId || !tableName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-center text-red-600">Table non reconnue</CardTitle>
            <CardDescription className="text-center">
              Impossible de reconnaître la table. Veuillez scanner à nouveau le QR code ou contacter un serveur.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Restaurant Easy Order</h1>
        <p className="text-xl mt-2">Table: {tableName}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bienvenue!</CardTitle>
          <CardDescription>
            Đặt hàng trực tiếp từ thiết bị của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Bạn đang ở bàn <strong>{tableName}</strong>. Hãy duyệt qua menu của chúng tôi và chọn những món ăn mà bạn muốn đặt hàng.
          </p>
          <p>
          Sau khi bạn đặt hàng, đơn hàng sẽ được gửi trực tiếp đến bếp của chúng tôi. Người phục vụ sẽ mang món ăn đến cho bạn ngay khi chúng đã sẵn sàng..
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg">
            Voir le menu
          </Button>
        </CardFooter>
      </Card>

      {/* Ici, vous pourriez ajouter les sections de menu, les catégories de plats, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Entrées</CardTitle>
            <CardDescription>Commencez votre repas avec nos délicieuses entrées</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full">Voir les entrées</Button>
          </CardFooter>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Plats principaux</CardTitle>
            <CardDescription>Découvrez nos plats signature</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full">Voir les plats</Button>
          </CardFooter>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Desserts</CardTitle>
            <CardDescription>Terminez en douceur avec nos desserts</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full">Voir les desserts</Button>
          </CardFooter>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Boissons</CardTitle>
            <CardDescription>Rafraîchissez-vous avec notre sélection de boissons</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full">Voir les boissons</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 