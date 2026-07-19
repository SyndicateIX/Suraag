import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from '../components/common/TopBar';
import { Sidebar } from '../components/common/Sidebar';
import { ScanlineOverlay } from '../components/common/ScanlineOverlay';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col overflow-x-hidden selection:bg-primary selection:text-on-primary">
      <ScanlineOverlay laser={false} />
      <TopBar />
      <div className="flex pt-16 flex-1">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 min-h-[calc(100vh-4rem)] relative overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
