import { useState } from "react";
import { 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Mail, 
  Download, 
  History, 
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Database,
  Zap,
  Link2,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

const navigation = [
  { name: "Resume Builder", icon: FileText, current: true },
  { name: "Job Analysis", icon: Briefcase, current: false },
  { name: "Match Scoring", icon: TrendingUp, current: false },
  { name: "Cover Letters", icon: Mail, current: false },
  { name: "Export Package", icon: Download, current: false },
  { name: "Application History", icon: History, current: false },
];

export default function Sidebar() {
  const { user, logout, isLoggingOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Hamburger Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-bullseye text-white text-sm"></i>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">JobBlaster</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Theme Toggle for Mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed top-0 left-0 z-50 h-full w-80 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Sidebar Content */}
        <div className="pt-16 flex flex-col h-full">
          {/* Logo and Brand */}
          <div className="p-6 border-b border-slate-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-bullseye text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">JobBlaster</h1>
                <p className="text-xs text-slate-500 dark:text-gray-400">AI-Powered Job Application Platform</p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/">
              <div 
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg font-medium cursor-pointer",
                  location === "/"
                    ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                    : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                )}
                onClick={closeMobileMenu}
              >
                <FileText className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
            </Link>
            
            {navigation.slice(1).map((item) => (
              <div
                key={item.name}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg font-medium text-slate-400 dark:text-gray-500 cursor-not-allowed"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                <span className="text-xs bg-slate-100 dark:bg-gray-800 px-2 py-1 rounded-full">Soon</span>
              </div>
            ))}

            {/* System Tools Section */}
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                System Tools
              </h3>
              <Link href="/connectors">
                <div 
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg font-medium cursor-pointer",
                    location === "/connectors"
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                      : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Link2 className="w-5 h-5" />
                  <span>Connectors</span>
                </div>
              </Link>
              <Link href="/search-criteria">
                <div 
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg font-medium cursor-pointer",
                    location === "/search-criteria"
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                      : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Target className="w-5 h-5" />
                  <span>Search Criteria</span>
                </div>
              </Link>
              <Link href="/scraped-jobs">
                <div 
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg font-medium cursor-pointer",
                    location === "/scraped-jobs"
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                      : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Briefcase className="w-5 h-5" />
                  <span>Scraped Jobs</span>
                </div>
              </Link>
              <Link href="/templates">
                <div 
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg font-medium cursor-pointer",
                    location === "/templates"
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                      : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Zap className="w-5 h-5" />
                  <span>AI Prompt Templates</span>
                </div>
              </Link>
              <Link href="/assigned-templates">
                <div 
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg font-medium cursor-pointer",
                    location === "/assigned-templates"
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                      : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Settings className="w-5 h-5" />
                  <span>Assigned Templates</span>
                </div>
              </Link>
              <Link href="/external-logs">
                <div 
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg font-medium cursor-pointer",
                    location === "/external-logs"
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                      : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Database className="w-5 h-5" />
                  <span>External API Logs</span>
                </div>
              </Link>
            </div>
          </nav>

          {/* Mobile User Section */}
          <div className="p-4 border-t border-slate-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Personal Account</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    location === "/profile"
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                      : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
                  )}
                  onClick={closeMobileMenu}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toggleTheme();
                  closeMobileMenu();
                }}
                className="w-full justify-start text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                disabled={isLoggingOut}
                className="w-full justify-start text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-700 flex-col">
        {/* Logo and Brand */}
        <div className="p-6 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-bullseye text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">JobBlaster</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">AI-Powered Job Application Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/">
            <div className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg font-medium cursor-pointer text-sm",
              location === "/"
                ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
            )}>
              <FileText className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </Link>
          
          {navigation.slice(1).map((item) => (
            <div
              key={item.name}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-slate-400 dark:text-gray-500 cursor-not-allowed text-sm"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
              <span className="text-xs bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">Soon</span>
            </div>
          ))}

          {/* System Tools Section */}
          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              System Tools
            </h3>
            <Link href="/connectors">
              <div className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg font-medium cursor-pointer text-sm",
                location === "/connectors"
                  ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                  : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
              )}>
                <Link2 className="w-4 h-4" />
                <span>Connectors</span>
              </div>
            </Link>
            <Link href="/templates">
              <div className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg font-medium cursor-pointer text-sm",
                location === "/templates"
                  ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                  : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
              )}>
                <Zap className="w-4 h-4" />
                <span>AI Prompt Templates</span>
              </div>
            </Link>
            <Link href="/assigned-templates">
              <div className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg font-medium cursor-pointer text-sm",
                location === "/assigned-templates"
                  ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                  : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
              )}>
                <Settings className="w-4 h-4" />
                <span>Assigned Templates</span>
              </div>
            </Link>
            <Link href="/external-logs">
              <div className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg font-medium cursor-pointer text-sm",
                location === "/external-logs"
                  ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                  : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
              )}>
                <Database className="w-4 h-4" />
                <span>External API Logs</span>
              </div>
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.username || "User"}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">Personal Workspace</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start",
                  location === "/profile"
                    ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                    : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
                )}
              >
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 mr-2" />
              ) : (
                <Moon className="w-4 h-4 mr-2" />
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="w-full justify-start text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
