import React from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { auth } from "./firebase";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Members from "./components/Members";
import Services from "./components/Services";
import AttendanceTracker from "./components/Attendance";
import Profile from "./components/Profile";
import { Church, LogIn } from "lucide-react";

import Reports from "./components/Reports";

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [initialAction, setInitialAction] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigate = (tab: string, action?: string) => {
    setActiveTab(tab);
    if (action) {
      setInitialAction(action);
    } else {
      setInitialAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border p-8 text-center space-y-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <Church className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Igreja Vila Esperança</h1>
            <p className="text-neutral-500 mt-2">Sistema de Controle de Faltas e Frequência</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-neutral-100 hover:border-indigo-100 hover:bg-indigo-50 py-4 rounded-2xl font-bold text-neutral-700 transition-all group"
          >
            <LogIn className="w-5 h-5 text-neutral-400 group-hover:text-indigo-600" />
            Entrar com Google
          </button>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Acesso restrito a administradores</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard onNavigate={handleNavigate} />;
      case "members": return <Members initialAction={initialAction} onActionComplete={() => setInitialAction(null)} />;
      case "services": return <Services initialAction={initialAction} onActionComplete={() => setInitialAction(null)} />;
      case "attendance": return <AttendanceTracker />;
      case "reports": return <Reports />;
      case "profile": return <Profile user={user} onLogout={handleLogout} />;
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
}
