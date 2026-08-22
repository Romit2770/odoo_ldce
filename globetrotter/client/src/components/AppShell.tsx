/**
 * Storybook Atlas UI reminder: the shell keeps each screen in a connected travel desk.
 * Globe Coral signals action, marigold signals ideas/status, and teal signals places/progress.
 */

import { BadgeHelp, Compass, LayoutDashboard, ListTree, LogOut, Map, Menu, PlaneTakeoff, Search, Settings, Share2, UserRound, WalletCards } from "lucide-react";
import { GlobalSearchDialog } from "@/components/DemoUi";
import brandLogo from "@/assets/branding/globetrotter-logo.png";
import { useLocation } from "wouter";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extractFirstName } from "@/lib/nameFormatter";
import { toast } from "sonner";

type AppShellProps = { children: ReactNode };

const navItems = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/trips", "My trips", ListTree],
  ["/discover", "Discover", Compass],
  ["/destinations", "Destinations", Map],
  ["/activities", "Activities", BadgeHelp],
] as const;

export function AppShell({ children }: AppShellProps) {
  const [pathname, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path: string) =>
    path === "/dashboard"
      ? pathname === "/" || pathname === "/dashboard"
      : pathname === path || (path === "/trips" && pathname.startsWith("/trips"));

  const handleSignOut = () => {
    logout();
    toast.success("Signed out of your travel desk.");
    setLocation("/login");
  };

  const displayName = extractFirstName(user?.name);

  return (
    <div className="story-app">
      <aside className="story-sidebar">
        <button className="brand-lockup brand-button" onClick={() => setLocation("/dashboard")}>
          <img src={brandLogo} alt="GlobeTrotter" className="brand-mark" />
          <span>
            <span className="brand-name">GlobeTrotter</span>
            <span className="brand-tag">Plan it your way</span>
          </span>
        </button>
        <button className="new-trip-button" onClick={() => setLocation("/trips/new")}>
          <PlaneTakeoff size={18} strokeWidth={2.5} /> Plan a new trip
        </button>
        <nav className="side-nav" aria-label="Primary navigation">
          <span className="nav-eyebrow">Travel desk</span>
          {navItems.map(([path, label, Icon]) => (
            <button
              key={path}
              className={`side-nav-link ${isActive(path) ? "is-active" : ""}`}
              onClick={() => setLocation(path)}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{label}</span>
              {path === "/trips" && <i className="tiny-dot" aria-hidden="true" />}
            </button>
          ))}
        </nav>
        <nav className="side-nav compact" aria-label="Utilities">
          <span className="nav-eyebrow">Your space</span>
          <button
            className={`side-nav-link ${pathname === "/profile" ? "is-active" : ""}`}
            onClick={() => setLocation("/profile")}
          >
            <UserRound size={18} />
            <span>Profile</span>
          </button>
          <button
            className={`side-nav-link ${pathname === "/settings" ? "is-active" : ""}`}
            onClick={() => setLocation("/settings")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="side-nav-link" onClick={handleSignOut} title="Sign out of demo">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </nav>
        <div className="sidebar-postcard">
          <Share2 size={17} />
          <strong>Your Goa story</strong>
          <p>Eight planned moments and room for one more good surprise.</p>
          <button onClick={() => setLocation("/trips/goa-adventure/share")}>
            Open share pass <span>→</span>
          </button>
        </div>
      </aside>

      <header className="mobile-story-header">
        <button className="brand-lockup brand-button" onClick={() => setLocation("/dashboard")}>
          <img src={brandLogo} alt="GlobeTrotter" className="brand-mark" />
          <span className="brand-name">GlobeTrotter</span>
        </button>
        <button className="icon-button" aria-label="Open navigation" onClick={() => setLocation("/trips")}>
          <Menu size={21} />
        </button>
      </header>
      <main className="story-main">
        <div className="topbar">
          <div className="topbar-leading">
            <div className="topbar-brand">
              <img src={brandLogo} alt="GlobeTrotter" />
              <span>GlobeTrotter</span>
            </div>
            <div className="breadcrumb">
              <Map size={14} /> Travel desk <span>/</span>{" "}
              {pathname.includes("goa-adventure")
                ? "Goa Adventure"
                : pathname === "/trips"
                ? "My trips"
                : "Your next story"}
            </div>
          </div>
          <div className="topbar-actions">
            <button className="help-chip" onClick={() => setSearchOpen(true)}>
              <Search size={15} /> Search atlas
            </button>
            <button
              className="profile-button"
              aria-label="Open profile"
              onClick={() => setLocation("/profile")}
            >
              <UserRound size={20} /> <span>{displayName}</span>
            </button>
          </div>
        </div>
        {children}
      </main>
      <GlobalSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onRoute={(path) => {
          setSearchOpen(false);
          setLocation(path);
        }}
      />
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button className={isActive("/dashboard") ? "active" : ""} onClick={() => setLocation("/dashboard")}>
          <LayoutDashboard size={18} />
          <span>Desk</span>
        </button>
        <button className={isActive("/trips") ? "active" : ""} onClick={() => setLocation("/trips")}>
          <ListTree size={18} />
          <span>Trips</span>
        </button>
        <button className={isActive("/discover") ? "active" : ""} onClick={() => setLocation("/discover")}>
          <Compass size={18} />
          <span>Discover</span>
        </button>
        <button
          className={pathname.includes("budget") ? "active" : ""}
          onClick={() => setLocation("/trips/goa-adventure/budget")}
        >
          <WalletCards size={18} />
          <span>Budget</span>
        </button>
      </nav>
    </div>
  );
}
