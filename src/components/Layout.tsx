import React from "react";
import { Church, Users, Calendar, LayoutDashboard, LogOut, Menu, X, FileText, CheckCircle2, User } from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, user, onLogout }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "members", label: "Membros", icon: Users },
    { id: "services", label: "Cultos", icon: Calendar },
    { id: "attendance", label: "Frequência", icon: CheckCircle2 },
    { id: "reports", label: "Relatórios", icon: FileText },
    { id: "profile", label: "Perfil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans text-neutral-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Church className="w-5 h-5 text-white" />
          </div>
          <span className="font-black uppercase italic tracking-tighter text-indigo-900">Vila Esperança</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-40 md:hidden transition-all duration-500"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-neutral-100 w-72 transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] md:relative md:translate-x-0 md:w-72",
        isMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="p-8 flex flex-col h-full">
          <div className="hidden md:flex items-center gap-4 mb-12">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <Church className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl text-neutral-900 leading-none uppercase italic tracking-tighter">Vila Esperança</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-black mt-1">Management System</p>
            </div>
          </div>

          <div className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 px-4">Menu Principal</div>
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group",
                  activeTab === item.id
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform duration-300", activeTab === item.id ? "text-white scale-110" : "text-neutral-400 group-hover:scale-110")} />
                <span className="tracking-tight">{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-neutral-100 mt-auto">
            <button 
              onClick={() => setActiveTab("profile")}
              className={cn(
                "w-full bg-neutral-50 rounded-2xl p-4 mb-4 flex items-center gap-3 border transition-all hover:shadow-md text-left",
                activeTab === "profile" ? "border-indigo-200 bg-indigo-50" : "border-neutral-100"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl shadow-sm flex items-center justify-center font-black text-sm border transition-colors",
                activeTab === "profile" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-indigo-600 border-neutral-100"
              )}>
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-neutral-900 truncate uppercase tracking-tight">{user?.email?.split('@')[0]}</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Online</p>
                </div>
              </div>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4 h-4" />
              Encerrar Sessão
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-6 md:p-12">
          {children}
        </div>
        
        {/* Decorative elements */}
        <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-5 hidden lg:block">
          <Church className="w-64 h-64 text-neutral-900" />
        </div>
      </main>
    </div>
  );
}
