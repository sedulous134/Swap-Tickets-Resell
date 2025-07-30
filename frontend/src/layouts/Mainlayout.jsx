
import React from "react";
import { Outlet } from "react-router-dom";
import StickyNavbar from "../components/Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <StickyNavbar />
      {/* Content */}
      <main className="flex-grow  bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
