import React from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Member, Service, Attendance } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Table, PieChart as PieIcon, Calendar, Users, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "../lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [attendance, setAttendance] = React.useState<Attendance[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersSnap, servicesSnap, attendanceSnap] = await Promise.all([
          getDocs(query(collection(db, "members"), orderBy("name"))),
          getDocs(query(collection(db, "services"), orderBy("date", "desc"))),
          getDocs(collection(db, "attendance"))
        ]);

        setMembers(membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
        setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
        setAttendance(attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance)));
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const serviceChartData = services.slice(0, 8).reverse().map(service => {
    const serviceAttendance = attendance.filter(a => a.serviceId === service.id);
    const present = serviceAttendance.filter(a => a.status === "Presente").length;
    return {
      name: format(new Date(service.date), "dd/MM"),
      presentes: present,
      total: members.length
    };
  });

  const categoryData = [
    { name: 'Adultos', value: members.filter(m => m.category === 'Adulto').length },
    { name: 'Jovens', value: members.filter(m => m.category === 'Jovem').length },
    { name: 'Crianças', value: members.filter(m => m.category === 'Criança').length },
    { name: 'Visitantes', value: members.filter(m => m.category === 'Visitante').length },
  ].filter(c => c.value > 0);

  const exportCSV = () => {
    const header = ["Membro", ...services.map(s => `${s.title} (${format(new Date(s.date), "dd/MM")})`)];
    const rows = members.map(member => {
      const memberAttendance = services.map(service => {
        const record = attendance.find(a => a.memberId === member.id && a.serviceId === service.id);
        return record ? record.status : "Ausente";
      });
      return [member.name, ...memberAttendance];
    });

    const csvContent = [
      header.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `frequencia_igreja_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório de Frequência - Igreja Vila Esperança", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "PPP", { locale: ptBR })}`, 14, 30);

    const summaryData = services.map(service => {
      const serviceAttendance = attendance.filter(a => a.serviceId === service.id);
      const present = serviceAttendance.filter(a => a.status === "Presente").length;
      const justified = serviceAttendance.filter(a => a.status === "Justificado").length;
      const absent = members.length - present - justified;
      
      return [
        format(new Date(service.date), "dd/MM/yyyy"),
        service.title,
        present,
        justified,
        absent,
        `${Math.round((present / members.length) * 100)}%`
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [["Data", "Culto", "Pres.", "Just.", "Aus.", "% Pres."]],
      body: summaryData,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] }
    });

    const memberStats = members.map(member => {
      const memberAttendance = attendance.filter(a => a.memberId === member.id);
      const present = memberAttendance.filter(a => a.status === "Presente").length;
      const justified = memberAttendance.filter(a => a.status === "Justificado").length;
      const absent = services.length - present - justified;

      return [
        member.name,
        member.category,
        present,
        justified,
        absent,
        `${Math.round((present / services.length) * 100)}%`
      ];
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [["Membro", "Categoria", "Total Pres.", "Total Just.", "Total Aus.", "% Freq."]],
      body: memberStats,
      theme: "grid",
      headStyles: { fillColor: [31, 41, 55] }
    });

    doc.save(`relatorio_frequencia_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-neutral-900 uppercase italic tracking-tighter">Relatórios</h2>
          <p className="text-neutral-500 font-medium tracking-tight">Análise profunda de frequência e engajamento.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-2xl text-xs font-black uppercase tracking-widest text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm"
          >
            <Table className="w-4 h-4 text-emerald-600" />
            CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </header>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-black text-neutral-900 uppercase italic tracking-tighter">Presença por Culto</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a3a3a3', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a3a3a3', fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="presentes" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-violet-50 rounded-xl">
              <PieIcon className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-black text-neutral-900 uppercase italic tracking-tighter">Distribuição</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-black text-neutral-900 uppercase italic tracking-tighter">Analisados</h3>
          </div>
          <p className="text-4xl font-black text-neutral-900 font-mono">{services.length}</p>
          <p className="text-[10px] text-neutral-400 mt-2 uppercase tracking-widest font-black">Total de Cultos</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-black text-neutral-900 uppercase italic tracking-tighter">Média Geral</h3>
          </div>
          <p className="text-4xl font-black text-neutral-900 font-mono">
            {services.length > 0 ? Math.round((attendance.filter(a => a.status === "Presente").length / (services.length * members.length)) * 100) : 0}%
          </p>
          <p className="text-[10px] text-neutral-400 mt-2 uppercase tracking-widest font-black">Presença Acumulada</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-black text-neutral-900 uppercase italic tracking-tighter">Justificativas</h3>
          </div>
          <p className="text-4xl font-black text-neutral-900 font-mono">
            {attendance.filter(a => a.status === "Justificado").length}
          </p>
          <p className="text-[10px] text-neutral-400 mt-2 uppercase tracking-widest font-black">Total Registrado</p>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-100">
          <h3 className="font-black text-neutral-900 uppercase italic tracking-tighter text-xl">Desempenho por Culto</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-5">Culto</th>
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Presentes</th>
                <th className="px-8 py-5">Justificados</th>
                <th className="px-8 py-5">Ausentes</th>
                <th className="px-8 py-5">% Freq.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {services.map(service => {
                const serviceAttendance = attendance.filter(a => a.serviceId === service.id);
                const present = serviceAttendance.filter(a => a.status === "Presente").length;
                const justified = serviceAttendance.filter(a => a.status === "Justificado").length;
                const absent = members.length - present - justified;
                const rate = members.length > 0 ? Math.round((present / members.length) * 100) : 0;

                return (
                  <tr key={service.id} className="hover:bg-neutral-50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">{service.title}</td>
                    <td className="px-8 py-5 text-neutral-500 font-medium">{format(new Date(service.date), "dd/MM/yyyy")}</td>
                    <td className="px-8 py-5">
                      <span className="text-emerald-600 font-black font-mono">{present}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-orange-500 font-black font-mono">{justified}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-rose-500 font-black font-mono">{absent}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              rate > 70 ? "bg-emerald-500" : rate > 40 ? "bg-orange-500" : "bg-rose-500"
                            )}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="font-black font-mono text-xs">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
