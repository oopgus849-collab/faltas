import React from "react";
import { Church, CheckCircle2, XCircle, AlertCircle, Search, Calendar, Save, ChevronRight, ChevronLeft } from "lucide-react";
import { collection, getDocs, setDoc, doc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Member, Service, Attendance, AttendanceStatus } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../lib/utils";

export default function AttendanceTracker() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const [attendanceRecords, setAttendanceRecords] = React.useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active members
        const membersSnap = await getDocs(query(collection(db, "members"), where("active", "==", true), orderBy("name")));
        const membersData = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
        setMembers(membersData);

        // Fetch recent services
        const servicesSnap = await getDocs(query(collection(db, "services"), orderBy("date", "desc"), limit(10)));
        const servicesData = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        setServices(servicesData);

        if (servicesData.length > 0) {
          setSelectedService(servicesData[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  React.useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedService) return;
      try {
        const q = query(collection(db, "attendance"), where("serviceId", "==", selectedService.id));
        const snap = await getDocs(q);
        const records: Record<string, AttendanceStatus> = {};
        snap.docs.forEach(doc => {
          const data = doc.data() as Attendance;
          records[data.memberId] = data.status;
        });
        setAttendanceRecords(records);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [selectedService]);

  const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [memberId]: prev[memberId] === status ? "Ausente" : status
    }));
  };

  const saveAttendance = async () => {
    if (!selectedService) return;
    setSaving(true);
    try {
      const promises = members.map(member => {
        const status = attendanceRecords[member.id] || "Ausente";
        const attendanceId = `${selectedService.id}_${member.id}`;
        return setDoc(doc(db, "attendance", attendanceId), {
          memberId: member.id,
          serviceId: selectedService.id,
          status,
          date: selectedService.date,
        });
      });
      await Promise.all(promises);
      alert("Frequência salva com sucesso!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Erro ao salvar frequência.");
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="py-12 text-center text-neutral-500">Carregando...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-neutral-900 uppercase italic tracking-tighter">Frequência</h2>
          <p className="text-neutral-500 font-medium tracking-tight">Registro de presença e justificativas.</p>
        </div>
        <button
          onClick={saveAttendance}
          disabled={saving || !selectedService}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
        >
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
          Salvar Frequência
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Service Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Selecionar Culto
            </h3>
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] pb-2 lg:pb-0 pr-2 custom-scrollbar">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={cn(
                    "min-w-[220px] lg:min-w-0 text-left p-5 rounded-2xl text-sm transition-all border shrink-0 group",
                    selectedService?.id === service.id
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
                      : "bg-neutral-50 border-neutral-100 text-neutral-600 hover:bg-white hover:shadow-md"
                  )}
                >
                  <p className="font-black truncate tracking-tight">{service.title}</p>
                  <p className={cn(
                    "text-[9px] font-black uppercase tracking-widest mt-2",
                    selectedService?.id === service.id ? "text-indigo-100" : "text-neutral-400"
                  )}>
                    {format(new Date(service.date), "dd/MM/yyyy")} • {service.type}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 hidden lg:block relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <CheckCircle2 className="w-32 h-32 text-white" />
            </div>
            <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-6">Resumo do Culto</h4>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <span className="text-indigo-100 text-xs font-bold">Presentes</span>
                <span className="text-3xl font-black text-white leading-none">
                  {Object.values(attendanceRecords).filter(s => s === "Presente").length}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-indigo-100 text-xs font-bold">Ausentes</span>
                <span className="text-3xl font-black text-white leading-none">
                  {members.length - Object.values(attendanceRecords).filter(s => s === "Presente").length}
                </span>
              </div>
              <div className="pt-6 border-t border-indigo-500/50 flex justify-between items-center">
                <span className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Total Ativos</span>
                <span className="text-white font-black">{members.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-[2rem] border border-neutral-100 shadow-sm">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar membro..."
                className="w-full pl-14 pr-6 py-5 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-neutral-50">
              {filteredMembers.map((member) => (
                <div key={member.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-neutral-50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      {member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-neutral-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{member.name}</p>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{member.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleStatusChange(member.id, "Presente")}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        attendanceRecords[member.id] === "Presente"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100 scale-105"
                          : "bg-white text-neutral-400 border-neutral-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                      )}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Pres.</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(member.id, "Justificado")}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        attendanceRecords[member.id] === "Justificado"
                          ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100 scale-105"
                          : "bg-white text-neutral-400 border-neutral-100 hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200"
                      )}
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>Just.</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(member.id, "Ausente")}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        (attendanceRecords[member.id] === "Ausente" || !attendanceRecords[member.id])
                          ? "bg-rose-50 text-rose-600 border-rose-100 shadow-sm"
                          : "bg-white text-neutral-400 border-neutral-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      )}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Aus.</span>
                    </button>
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
