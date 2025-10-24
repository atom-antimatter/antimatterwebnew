"use client";

import { useState, useEffect } from "react";
import { ServicesData, ServiceProps } from "@/data/services";
import { getServiceAnalytics, validateServices } from "@/lib/serviceScanner";
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineLink, HiOutlinePencil, HiOutlineArrowPath } from "react-icons/hi2";
import { motion } from "motion/react";

interface ServiceManagerProps {
  onEditService?: (service: ServiceProps) => void;
}

export default function ServiceManager({ onEditService }: ServiceManagerProps) {
  const [services, setServices] = useState<ServiceProps[]>(ServicesData);
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [analytics, setAnalytics] = useState(getServiceAnalytics());
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filteredServices = services.filter(service => {
    switch (filter) {
      case 'visible':
        return !service.hidden;
      case 'hidden':
        return service.hidden;
      default:
        return true;
    }
  });

  const refreshServices = () => {
    setServices([...ServicesData]);
    setAnalytics(getServiceAnalytics());
    setLastRefresh(new Date());
  };

  const toggleVisibility = (service: ServiceProps) => {
    setServices(prev => 
      prev.map(s => 
        s.link === service.link 
          ? { ...s, hidden: !s.hidden }
          : s
      )
    );
    // Update analytics after visibility change
    setTimeout(() => {
      setAnalytics(getServiceAnalytics());
    }, 100);
  };

  const getStatusBadge = (service: ServiceProps) => {
    if (service.hidden) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <HiOutlineEyeSlash className="w-3 h-3 mr-1" />
          Hidden
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <HiOutlineEye className="w-3 h-3 mr-1" />
        Visible
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Service Management</h2>
          <p className="text-foreground/60 mt-1">
            Manage your services and their visibility on the website
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-foreground/60">
            <span>Total: {analytics.totalServices}</span>
            <span>Visible: {analytics.visibleServices}</span>
            <span>Hidden: {analytics.hiddenServices}</span>
            <span>Last scan: {lastRefresh.toLocaleTimeString()}</span>
          </div>
        </div>
        <button
          onClick={refreshServices}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <HiOutlineArrowPath className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          All Services ({services.length})
        </button>
        <button
          onClick={() => setFilter('visible')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'visible'
              ? 'bg-primary text-primary-foreground'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          Visible ({services.filter(s => !s.hidden).length})
        </button>
        <button
          onClick={() => setFilter('hidden')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'hidden'
              ? 'bg-primary text-primary-foreground'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          Hidden ({services.filter(s => s.hidden).length})
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-zinc-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-zinc-100 rounded-lg">
                  <service.icon className="w-6 h-6 text-zinc-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">{service.title}</h3>
                  <p className="text-sm text-zinc-500">/{service.link}</p>
                </div>
              </div>
              {getStatusBadge(service)}
            </div>

            <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
              {service.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleVisibility(service)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    service.hidden
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  {service.hidden ? 'Show' : 'Hide'}
                </button>
                <a
                  href={service.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  <HiOutlineLink className="w-3 h-3" />
                  <span>View</span>
                </a>
                {onEditService && (
                  <button
                    onClick={() => onEditService(service)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                  >
                    <HiOutlinePencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>

            {service.customCTA && (
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <p className="text-xs text-zinc-500 mb-1">Demo Link:</p>
                <a
                  href={service.customCTA.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {service.customCTA.href}
                </a>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Auto-detection notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Auto-Detection Enabled</h4>
            <p className="text-sm text-blue-700 mt-1">
              New services added to the codebase will automatically appear in this CMS. 
              The system scans for new service definitions and updates the management interface accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
