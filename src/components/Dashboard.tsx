import React from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../firebase";
import { Member, Service, Attendance } from "../types";
import { Users, Calendar, CheckCircle, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: number | string;
  trendUp?: boolean;
  trendLabel?: string;
}

function StatCard({ title, value, icon: Icon, color, trend, trendUp, trendLabel }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300", color)}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
            trendUp ? "bg-green-50 text-green-600" : "bg-neutral-50 text-neutral-500"
          )}>
            {trendUp && <TrendingUp className="w-3 h-3" />}
            {trend} {trendLabel}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-neutral-900 tracking-tight font-mono">{value}</h3>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }: { onNavigate: (tab: string, action?: string) => void }) {
  const [stats, setStats] = React.useState({
    totalMembers: 0,
    activeMembers: 0,
    recentAttendance: 0,
    attendanceTrend: 0,
  });
  const [recentServices, setRecentServices] = React.useState<Service[]>([]);
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total Members
        const membersSnap = await getDocs(collection(db, "members"));
        const members = membersSnap.docs.map(doc => doc.data() as Member);
        const activeMembers = members.filter(m => m.active).length;

        // Recent Services
        const servicesQuery = query(
          collection(db, "services"),
          orderBy("date", "desc"),
          limit(10)
        );
        const servicesSnap = await getDocs(servicesQuery);
        const services = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)).reverse();
        
        // Attendance for chart
        const attendanceSnap = await getDocs(collection(db, "attendance"));
        const allAttendance = attendanceSnap.docs.map(doc => doc.data() as Attendance);

        const data = services.map(service => {
          const serviceAttendance = allAttendance.filter(a => a.serviceId === service.id);
          const present = serviceAttendance.filter(a => a.status === "Presente").length;
          const rate = activeMembers > 0 ? Math.round((present / activeMembers) * 100) : 0;
          
          return {
            name: format(new Date(service.date), "dd/MM"),
            frequencia: rate,
            presentes: present
          };
        });
        setChartData(data);
        setRecentServices([...services].reverse().slice(0, 5));

        // Attendance for the last service
        let lastAttendanceRate = 0;
        if (services.length > 0) {
          const lastService = services[services.length - 1];
          const lastAttendance = allAttendance.filter(a => a.serviceId === lastService.id);
          const presentCount = lastAttendance.filter(a => a.status === "Presente").length;
          lastAttendanceRate = activeMembers > 0 ? (presentCount / activeMembers) * 100 : 0;
        }

        setStats({
          totalMembers: members.length,
          activeMembers,
          recentAttendance: Math.round(lastAttendanceRate),
          attendanceTrend: 5, // Mock trend
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-neutral-900 tracking-tighter uppercase italic">Vila Esperança</h2>
          <p className="text-neutral-500 font-medium tracking-tight">Painel de Controle • {format(new Date(), "PPP", { locale: ptBR })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                {i}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Equipe Ativa</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Membros"
          value={stats.totalMembers}
          icon={Users}
          color="bg-indigo-50 text-indigo-600"
          trend={stats.activeMembers}
          trendLabel="ativos"
        />
        <StatCard
          title="Frequência"
          value={`${stats.recentAttendance}%`}
          icon={CheckCircle}
          color="bg-emerald-50 text-emerald-600"
          trend={stats.attendanceTrend}
          trendUp={true}
          trendLabel="vs anterior"
        />
        <StatCard
          title="Cultos"
          value={recentServices.length}
          icon={Calendar}
          color="bg-violet-50 text-violet-600"
          trendLabel="últimos 30 dias"
        />
        <StatCard
          title="Inativos"
          value={stats.totalMembers - stats.activeMembers}
          icon={AlertCircle}
          color="bg-rose-50 text-rose-600"
          trendLabel="membros"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-neutral-900 text-xl uppercase italic tracking-tighter">Tendência de Frequência</h3>
              <p className="text-sm text-neutral-400 font-medium">Percentual de presença nos últimos cultos</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Presença %
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#a3a3a3', fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#a3a3a3', fontWeight: 700 }}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '12px 16px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="frequencia" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorFreq)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-neutral-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-500" />
            <h3 className="font-black text-xl mb-8 relative z-10 uppercase italic tracking-tighter">Ações Rápidas</h3>
            <div className="space-y-3 relative z-10">
              <button 
                onClick={() => onNavigate("members", "new-member")}
                className="w-full py-4 px-5 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between group/btn border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Novo Membro
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-all -translate-x-2 group-hover/btn:translate-x-0" />
              </button>
              <button 
                onClick={() => onNavigate("services", "new-service")}
                className="w-full py-4 px-5 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between group/btn border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  Agendar Culto
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-all -translate-x-2 group-hover/btn:translate-x-0" />
              </button>
              <button 
                onClick={() => onNavigate("attendance")}
                className="w-full py-4 px-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-sm font-black uppercase tracking-widest transition-all text-center mt-8 shadow-lg shadow-indigo-950/40"
              >
                Lançar Frequência
              </button>
              <button 
                onClick={() => onNavigate("reports")}
                className="w-full py-4 px-5 bg-white text-neutral-900 hover:bg-neutral-100 rounded-2xl text-sm font-black uppercase tracking-widest transition-all text-center mt-2"
              >
                Gerar Relatórios
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-neutral-900 uppercase italic tracking-tighter">Cultos Recentes</h3>
              <button 
                onClick={() => onNavigate("services")}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                Ver Tudo
              </button>
            </div>
            <div className="space-y-5">
              {recentServices.map((service) => (
                <div key={service.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex flex-col items-center justify-center border border-neutral-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all duration-300">
                    <span className="text-[9px] font-black text-neutral-400 group-hover:text-indigo-400 uppercase tracking-tighter">{format(new Date(service.date), "MMM", { locale: ptBR })}</span>
                    <span className="text-sm font-black text-neutral-700 group-hover:text-indigo-700 font-mono">{format(new Date(service.date), "dd")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-900 truncate text-sm group-hover:text-indigo-600 transition-colors">{service.title}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{service.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
