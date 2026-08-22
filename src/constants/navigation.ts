export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  adminOnly?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', iconName: 'LayoutDashboard' },
  { title: 'My Trips', href: '/trips', iconName: 'Compass' },
  { title: 'Explore Destinations', href: '/destinations', iconName: 'MapPin' },
  { title: 'Activities Catalog', href: '/activities', iconName: 'Sparkles' },
  { title: 'Community Discover', href: '/discover', iconName: 'Globe' },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/admin', iconName: 'BarChart3' },
  { title: 'Users Management', href: '/admin/users', iconName: 'Users' },
  { title: 'Trips Registry', href: '/admin/trips', iconName: 'Map' },
  { title: 'Cities Database', href: '/admin/cities', iconName: 'Building2' },
  { title: 'Activities Database', href: '/admin/activities', iconName: 'Flame' },
  { title: 'System Analytics', href: '/admin/analytics', iconName: 'TrendingUp' },
];

export const USER_MENU_ITEMS: NavItem[] = [
  { title: 'My Profile', href: '/profile', iconName: 'User' },
  { title: 'Preferences & Settings', href: '/settings', iconName: 'Settings' },
];
