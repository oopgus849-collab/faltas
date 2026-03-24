export type MemberCategory = "Adulto" | "Jovem" | "Criança" | "Visitante";
export type AttendanceStatus = "Presente" | "Ausente" | "Justificado";
export type ServiceType = "Culto de Domingo" | "Culto de Oração" | "EBD" | "Outro";

export interface Member {
  id: string;
  name: string;
  phone: string;
  category: MemberCategory;
  active: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  title: string;
  date: string;
  type: ServiceType;
  description?: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  serviceId: string;
  status: AttendanceStatus;
  date: string;
}
