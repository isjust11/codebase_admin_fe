'use client';

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Cài đặt tài khoản
        </h3>
        <div className="space-y-6">
        </div>
      </div>
    </div>
    // <div className="container mx-auto">
    //   <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>

    //   <div className="grid gap-6">
    //     <Card>
    //       <CardHeader>
    //         <CardTitle>Giao diện</CardTitle>
    //         <CardDescription>
    //           Tùy chỉnh giao diện của ứng dụng
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         <div className="flex items-center justify-between">
    //           <div className="space-y-0.5">
    //             <Label htmlFor="dark-mode">Chế độ tối</Label>
    //             <p className="text-sm text-muted-foreground">
    //               Chuyển đổi giữa chế độ sáng và tối
    //             </p>
    //           </div>
    //           <div className="flex items-center space-x-2">
    //             <Switch
    //               id="dark-mode"
    //               checked={theme === "dark"}
    //               onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
    //             />
    //             {theme === "dark" ? (
    //               <Moon className="h-5 w-5" />
    //             ) : (
    //               <Sun className="h-5 w-5" />
    //             )}
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>
    //   </div>
    // </div>
  );
} 