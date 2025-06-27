'use client'
import { AuthProvider } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import AppHeader from "@/layouts/AppHeader";
import AppSidebar from "@/layouts/AppSidebar";
import Backdrop from "@/layouts/Backdrop";
import { LoadingProvider } from "@/contexts/LoadingContext";
import LoadingIndicator from "@/components/LoadingIndicator";

import React from "react";
import SocketManager from "@/store/socketManager";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <AuthProvider>
      <LoadingProvider>
        <div className="min-h-screen xl:flex">
          {/* Sidebar and Backdrop */}
          <AppSidebar />
          <Backdrop /> 
          {/* Main Content Area */}
          <div
            className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
          >
            {/* Header */}
            <AppHeader />
            {/* Page Content */}
            <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
            <SocketManager />
          </div>
        </div>
        <LoadingIndicator />
      </LoadingProvider>
    </AuthProvider>
  );
}
