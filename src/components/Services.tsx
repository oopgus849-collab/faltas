import React from "react";
import { Calendar, Plus, Search, MapPin, Clock, Tag, MoreVertical, Edit, Trash2, XCircle, X } from "lucide-react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Service, ServiceType } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../lib/utils";

export default function Services({ initialAction, onActionComplete }: { initialAction?: string | null, onActionComplete?: () => void }) {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: "Culto de Domingo" as ServiceType,
    description: "",
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "services"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchServices();
  }, []);

  React.useEffect(() => {
    if (initialAction === "new-service") {
      setEditingService(null);
      setFormData({
        title: "",
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        type: "Culto de Domingo",
        description: "",
      });
      setIsModalOpen(true);
      onActionComplete?.();
    }
  }, [initialAction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateDoc(doc(db, "services", editingService.id), formData);
      } else {
        await addDoc(collection(db, "services"), formData);
      }
      setIsModalOpen(false);
      setEditingService(null);
      setFormData({
        title: "",
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        type: "Culto de Domingo",
        description: "",
      });
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este culto/evento?")) {
      try {
        await deleteDoc(doc(db, "services", id));
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-neutral-900 uppercase italic tracking-tighter">Cultos</h2>
          <p className="text-neutral-500 font-medium tracking-tight">Agendamento e histórico de atividades.</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({
              title: "",
              date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
              type: "Culto de Domingo",
              description: "",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          Novo Culto
        </button>
      </header>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : services.length > 0 ? (
          services.map((service) => (
            <div key={service.id} className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                  service.type === "Culto de Domingo" ? "bg-blue-50 text-blue-600" :
                  service.type === "Culto de Oração" ? "bg-purple-50 text-purple-600" :
                  service.type === "EBD" ? "bg-green-50 text-green-600" :
                  "bg-neutral-50 text-neutral-600"
                )}>
                  {service.type}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingService(service);
                      setFormData({
                        title: service.title,
                        date: service.date,
                        type: service.type,
                        description: service.description || "",
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-neutral-50 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-neutral-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 bg-rose-50 text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all border border-rose-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-neutral-900 mb-6 tracking-tight group-hover:text-indigo-600 transition-colors">{service.title}</h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
                  <Calendar className="w-4 h-4 text-neutral-300" />
                  {format(new Date(service.date), "PPP", { locale: ptBR })}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
                  <Clock className="w-4 h-4 text-neutral-300" />
                  {format(new Date(service.date), "HH:mm")}
                </div>
                {service.description && (
                  <p className="text-xs font-medium text-neutral-400 line-clamp-2 mt-2 leading-relaxed">{service.description}</p>
                )}
              </div>

              <button
                className="w-full py-4 bg-neutral-50 hover:bg-indigo-600 text-neutral-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-neutral-100 hover:border-indigo-600"
              >
                Ver Detalhes
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Nenhum evento agendado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-neutral-900 uppercase italic tracking-tighter">
                    {editingService ? "Editar Culto" : "Novo Culto"}
                  </h3>
                  <p className="text-sm text-neutral-400 font-medium">Preencha os dados abaixo.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-neutral-100 rounded-2xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Título do Evento</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Ex: Culto de Celebração"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Data e Hora</label>
                    <input
                      required
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceType })}
                      className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="Culto de Domingo">Culto de Domingo</option>
                      <option value="Culto de Oração">Culto de Oração</option>
                      <option value="EBD">EBD</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Descrição (Opcional)</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    placeholder="Detalhes sobre o evento..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 mt-4"
                >
                  {editingService ? "Salvar Alterações" : "Agendar Culto"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
