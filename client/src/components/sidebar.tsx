import { 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Mail, 
  Download, 
  History, 
  Settings,
  Target,
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Target className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">TargetLock</h1>
            <p className="text-xs text-slate-500">Resume & Job Match Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href="#"
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium",
              item.current
                ? "bg-blue-600/10 text-blue-600"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </a>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">{user?.username || "User"}</p>
            <p className="text-xs text-slate-500">Personal Workspace</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </aside>
  );
}
