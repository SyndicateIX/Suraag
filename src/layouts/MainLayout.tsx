import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from '../components/common/TopBar';
import { Sidebar } from '../components/common/Sidebar';
import { ScanlineOverlay } from '../components/common/ScanlineOverlay';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col overflow-x-hidden selection:bg-primary selection:text-on-primary">
      <div className="print:hidden">
        <ScanlineOverlay laser={false} />
        <TopBar />
      </div>
      <div className="flex pt-16 print:pt-0 flex-1">
        <div className="print:hidden shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 ml-64 print:ml-0 p-4 sm:p-6 print:p-0 min-h-[calc(100vh-4rem)] print:min-h-0 relative overflow-x-hidden print:overflow-visible">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
