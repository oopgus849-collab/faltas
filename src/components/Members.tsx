import React from "react";
import { Users, Search, Plus, MoreVertical, Edit, Trash2, Phone, Tag, CheckCircle2, XCircle, X } from "lucide-react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Member, MemberCategory } from "../types";
import { cn } from "../lib/utils";

export default function Members({ initialAction, onActionComplete }: { initialAction?: string | null, onActionComplete?: () => void }) {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    category: "Adulto" as MemberCategory,
    active: true,
  });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "members"), orderBy("name"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  React.useEffect(() => {
    if (initialAction === "new-member") {
      setEditingMember(null);
      setFormData({ name: "", phone: "", category: "Adulto", active: true });
      setIsModalOpen(true);
      onActionComplete?.();
    }
  }, [initialAction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await updateDoc(doc(db, "members", editingMember.id), formData);
      } else {
        await addDoc(collection(db, "members"), {
          ...formData,
          createdAt: new Date().toISOString(),
        });
      }
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData({ name: "", phone: "", category: "Adulto", active: true });
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este membro?")) {
      try {
        await deleteDoc(doc(db, "members", id));
        fetchMembers();
      } catch (error) {
        console.error("Error deleting member:", error);
      }
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && members.length === 0) {
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
          <h2 className="text-4xl font-black text-neutral-900 uppercase italic tracking-tighter">Membros</h2>
          <p className="text-neutral-500 font-medium tracking-tight">Gestão da comunidade e visitantes.</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            setFormData({ name: "", phone: "", category: "Adulto", active: true });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          Novo Membro
        </button>
      </header>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-[2rem] border border-neutral-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                member.active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {member.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                {member.name[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-neutral-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{member.category}</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
                <Phone className="w-4 h-4 text-neutral-300" />
                {member.phone || "Sem telefone"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingMember(member);
                  setFormData({
                    name: member.name,
                    phone: member.phone,
                    category: member.category,
                    active: member.active,
                  });
                  setIsModalOpen(true);
                }}
                className="flex-1 py-3 px-4 bg-neutral-50 hover:bg-indigo-50 text-neutral-600 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-neutral-100 hover:border-indigo-100"
              >
                Editar Perfil
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-neutral-900 uppercase italic tracking-tighter">
                    {editingMember ? "Editar Membro" : "Novo Membro"}
                  </h3>
                  <p className="text-sm text-neutral-400 font-medium">Preencha os dados abaixo.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-neutral-100 rounded-2xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Categoria</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as MemberCategory })}
                      className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="Adulto">Adulto</option>
                      <option value="Jovem">Jovem</option>
                      <option value="Criança">Criança</option>
                      <option value="Visitante">Visitante</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="active" className="text-sm font-bold text-neutral-700 cursor-pointer">Membro Ativo</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 mt-4"
                >
                  {editingMember ? "Salvar Alterações" : "Cadastrar Membro"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
