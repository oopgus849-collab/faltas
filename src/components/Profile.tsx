import React from "react";
import { User, Mail, Shield, Settings, Bell, Lock, LogOut, Camera, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileProps {
  user: any;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  const [activeSection, setActiveSection] = React.useState("geral");

  const sections = [
    { id: "geral", label: "Informações Gerais", icon: User },
    { id: "seguranca", label: "Segurança", icon: Lock },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "preferencias", label: "Preferências", icon: Settings },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h2 className="text-4xl font-black text-neutral-900 uppercase italic tracking-tighter">Meu Perfil</h2>
        <p className="text-neutral-500 font-medium tracking-tight">Gerencie suas informações e configurações de conta.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-indigo-600" />
            <div className="relative z-10 mt-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-[2.2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-4xl border-4 border-white">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-3 bg-neutral-900 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="mt-6 font-black text-xl text-neutral-900 uppercase italic tracking-tighter">
                {user?.email?.split('@')[0]}
              </h3>
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mt-1">Administrador do Sistema</p>
              
              <div className="mt-8 pt-8 border-t border-neutral-50 flex justify-around">
                <div>
                  <p className="text-lg font-black text-neutral-900">100%</p>
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Acesso</p>
                </div>
                <div className="w-px h-8 bg-neutral-100" />
                <div>
                  <p className="text-lg font-black text-neutral-900">Ativo</p>
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Status</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group",
                  activeSection === section.id
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <section.icon className={cn("w-5 h-5", activeSection === section.id ? "text-indigo-600" : "text-neutral-400")} />
                {section.label}
              </button>
            ))}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all mt-4"
            >
              <LogOut className="w-5 h-5" />
              Encerrar Sessão
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-10 shadow-sm">
            {activeSection === "geral" && (
              <div className="space-y-10">
                <div>
                  <h4 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tighter mb-2">Informações da Conta</h4>
                  <p className="text-sm text-neutral-400 font-medium">Dados básicos de identificação no sistema.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-1">Endereço de E-mail</label>
                    <div className="flex items-center gap-4 px-6 py-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <Mail className="w-5 h-5 text-neutral-300" />
                      <span className="text-sm font-bold text-neutral-700">{user?.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-1">Nível de Acesso</label>
                    <div className="flex items-center gap-4 px-6 py-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <Shield className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-bold text-neutral-700">Administrador Master</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-indigo-900 rounded-[2rem] text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="relative z-10">
                    <h5 className="font-black text-lg uppercase italic tracking-tighter mb-4">Verificação de Segurança</h5>
                    <div className="flex items-center gap-3 text-indigo-200 text-sm font-medium mb-6">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Sua conta está protegida e verificada.
                    </div>
                    <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-100 transition-all">
                      Configurar 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "seguranca" && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tighter mb-2">Segurança</h4>
                  <p className="text-sm text-neutral-400 font-medium">Proteja sua conta com senhas fortes.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Senha Atual</label>
                    <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Nova Senha</label>
                      <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Confirmar Nova Senha</label>
                      <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                  </div>
                  <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                    Atualizar Senha
                  </button>
                </div>
              </div>
            )}

            {activeSection === "notificacoes" && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tighter mb-2">Notificações</h4>
                  <p className="text-sm text-neutral-400 font-medium">Escolha como deseja ser avisado.</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { title: "Alertas de Frequência", desc: "Receba avisos sobre faltas consecutivas." },
                    { title: "Relatórios Semanais", desc: "Resumo automático de atividades por e-mail." },
                    { title: "Novos Membros", desc: "Notificação quando um novo visitante é cadastrado." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-neutral-50 rounded-[2rem] border border-neutral-100">
                      <div>
                        <p className="font-black text-neutral-900 text-sm uppercase tracking-tight">{item.title}</p>
                        <p className="text-xs text-neutral-400 font-medium">{item.desc}</p>
                      </div>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "preferencias" && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tighter mb-2">Preferências</h4>
                  <p className="text-sm text-neutral-400 font-medium">Personalize sua experiência no sistema.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Idioma</label>
                    <select className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option>Português (Brasil)</option>
                      <option>English</option>
                      <option>Español</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Fuso Horário</label>
                    <select className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option>Brasília (GMT-3)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
