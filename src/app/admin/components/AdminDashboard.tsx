"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { HiArrowLeftOnRectangle, HiOutlineDocumentText, HiOutlineNewspaper, HiOutlineGlobeAlt } from "react-icons/hi2";
import PageManager from "./PageManager";
import BlogManager from "./BlogManager";
import SitemapViewer from "./SitemapViewer";

interface AdminDashboardProps {
  onLogout: () => void;
}

type ActiveTab = "pages" | "blog" | "sitemap";

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("pages");

  const tabs = [
    { id: "pages" as ActiveTab, label: "Pages", icon: HiOutlineDocumentText },
    { id: "blog" as ActiveTab, label: "Blog", icon: HiOutlineNewspaper },
    { id: "sitemap" as ActiveTab, label: "Sitemap", icon: HiOutlineGlobeAlt },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "pages":
        return <PageManager />;
      case "blog":
        return <BlogManager />;
      case "sitemap":
        return <SitemapViewer />;
      default:
        return <PageManager />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-foreground">Antimatter AI CMS</h1>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <HiArrowLeftOnRectangle className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-zinc-900/30 backdrop-blur-xl border-r border-zinc-800 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-secondary/20 text-secondary border border-secondary/30"
                      : "text-foreground/60 hover:text-foreground hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
