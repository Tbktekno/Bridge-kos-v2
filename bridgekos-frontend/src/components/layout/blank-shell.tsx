import { Outlet } from 'react-router-dom';

export function BlankShell() {
  return (
    <div className="min-h-svh bg-background">
      <Outlet />
    </div>
  );
}