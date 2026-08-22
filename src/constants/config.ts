/**
 * Application Global Configuration
 * Values can be configured via environment variables
 */

export const APP_CONFIG = {
  appName: 'GlobeTrotter',
  appTagline: 'Empowering Personalized Travel Planning',
  apiVersion: 'v1',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  odooIntegrationUrl: import.meta.env.VITE_ODOO_API_URL || '',
  defaultCurrency: 'USD',
  defaultMapProvider: (import.meta.env.VITE_MAP_PROVIDER as 'google' | 'mapbox' | 'osm') || 'osm',
  defaultAiProvider: (import.meta.env.VITE_AI_PROVIDER as 'mock' | 'openai' | 'gemini') || 'mock',
  features: {
    enableAiAssistant: import.meta.env.VITE_ENABLE_AI === 'true',
    enableCommunityCloning: true,
    enableMultiCurrency: true,
  },
  pagination: {
    defaultPageSize: 12,
    adminPageSize: 20,
  }
} as const;
