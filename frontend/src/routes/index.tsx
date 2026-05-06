import { ReactNode } from 'react';

// Define route structure
export interface Route {
  path: string;
  name: string;
  component: React.ComponentType<any>;
  layout?: string;
  isPublic?: boolean;
  icon?: ReactNode;
}

// Routes will be imported and defined in the App component
// This file serves as the route configuration structure
export const routeConfig = {
  public: [
    '/login',
    '/register',
    '/intro',
    '/guide',
  ],
  protected: [
    '/dashboard',
    '/products',
    '/stock-in',
    '/stock-out',
    '/expenses',
    '/reports',
    '/account',
  ],
};
