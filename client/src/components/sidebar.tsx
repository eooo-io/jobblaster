import { 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Mail, 
  Download, 
  History, 
  Settings,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Resume Builder", icon: FileText, current: true },
  { name: "Job Analysis", icon: Briefcase, current: false },
  { name: "Match Scoring", icon: TrendingUp, current: false },
  { name: "Cover Letters", icon: Mail, current: false },
  { name: "Export Package", icon: Download, current: false },
  { name: "Application History", icon: History, current: false },
];

export default function Sidebar() {
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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">John Doe</p>
            <p className="text-xs text-slate-500">Premium User</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
