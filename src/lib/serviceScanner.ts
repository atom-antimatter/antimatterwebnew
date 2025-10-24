import { ServiceProps, ServicesData } from "@/data/services";

/**
 * Service Scanner - Automatically detects new services and updates CMS
 * This utility helps the CMS automatically discover new services when they're added to the codebase
 */

export interface ServiceScanResult {
  totalServices: number;
  visibleServices: number;
  hiddenServices: number;
  newServices: ServiceProps[];
  lastScan: Date;
}

/**
 * Scans the services data and returns analytics
 */
export function scanServices(): ServiceScanResult {
  const now = new Date();
  const allServices = ServicesData;
  
  const visibleServices = allServices.filter(service => !service.hidden);
  const hiddenServices = allServices.filter(service => service.hidden);
  
  // For now, we'll consider all services as "current" since we're reading from the same source
  // In a more advanced implementation, this could compare against a stored state
  const newServices: ServiceProps[] = [];
  
  return {
    totalServices: allServices.length,
    visibleServices: visibleServices.length,
    hiddenServices: hiddenServices.length,
    newServices,
    lastScan: now
  };
}

/**
 * Gets service analytics for the CMS dashboard
 */
export function getServiceAnalytics() {
  const scanResult = scanServices();
  
  return {
    ...scanResult,
    visibilityRatio: scanResult.totalServices > 0 
      ? (scanResult.visibleServices / scanResult.totalServices) * 100 
      : 0,
    hasHiddenServices: scanResult.hiddenServices > 0,
    recentActivity: scanResult.newServices.length > 0
  };
}

/**
 * Validates that all services have required properties
 */
export function validateServices(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  ServicesData.forEach((service, index) => {
    if (!service.title) {
      errors.push(`Service ${index + 1}: Missing title`);
    }
    if (!service.link) {
      errors.push(`Service ${index + 1}: Missing link`);
    }
    if (!service.icon) {
      errors.push(`Service ${index + 1}: Missing icon`);
    }
    if (!service.items || service.items.length === 0) {
      errors.push(`Service ${index + 1}: Missing items`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets services by visibility status
 */
export function getServicesByVisibility(includeHidden: boolean = true): ServiceProps[] {
  if (includeHidden) {
    return ServicesData;
  }
  return ServicesData.filter(service => !service.hidden);
}

/**
 * Finds a service by its link
 */
export function findServiceByLink(link: string): ServiceProps | undefined {
  return ServicesData.find(service => service.link === link);
}

/**
 * Gets all service links for sitemap generation
 */
export function getAllServiceLinks(): string[] {
  return ServicesData.map(service => service.link);
}
