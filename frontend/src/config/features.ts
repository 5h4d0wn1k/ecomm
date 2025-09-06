// Feature flags and toggles
export const FEATURES = {
  // Authentication features
  registration: true,
  login: true,
  passwordReset: true,
  socialLogin: false, // Future feature

  // E-commerce features
  shoppingCart: true,
  wishlist: true,
  productReviews: true,
  productSearch: true,
  productFilters: true,
  productSorting: true,

  // Vendor features
  vendorDashboard: true,
  vendorRegistration: true,
  vendorAnalytics: true,

  // Admin features
  adminDashboard: true,
  userManagement: true,
  vendorManagement: true,
  productManagement: true,
  orderManagement: true,

  // Payment features
  stripePayment: true,
  paypalPayment: false, // Future feature
  codPayment: true,

  // Shipping features
  shiprocketIntegration: true,
  shippingCalculator: true,

  // Notification features
  emailNotifications: true,
  pushNotifications: false, // Future feature
  smsNotifications: false, // Future feature

  // Analytics features
  googleAnalytics: true,
  customAnalytics: false, // Future feature

  // PWA features
  offlineMode: false, // Future feature
  pushNotifications: false, // Future feature

  // Development features
  debugMode: process.env.NODE_ENV === 'development',
  mockData: process.env.NODE_ENV === 'development',
}

// Helper functions
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature]
}

export const getEnabledFeatures = (): (keyof typeof FEATURES)[] => {
  return Object.keys(FEATURES).filter(key => FEATURES[key as keyof typeof FEATURES]) as (keyof typeof FEATURES)[]
}

export const getDisabledFeatures = (): (keyof typeof FEATURES)[] => {
  return Object.keys(FEATURES).filter(key => !FEATURES[key as keyof typeof FEATURES]) as (keyof typeof FEATURES)[]
}