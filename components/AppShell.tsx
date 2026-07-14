import type { ReactNode } from "react";
import Header from "./Header";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";

export interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideTitleOnMobile?: boolean;
}

export function AppShell({
  children,
  title,
  subtitle,
  hideTitleOnMobile,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          hideTitleOnMobile={hideTitleOnMobile}
        />
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

export default AppShell;
