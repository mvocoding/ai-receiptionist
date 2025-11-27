export type Customer = {
  id: string;
  name: string;
  phone?: string;
  appointments: {
    date: string;
    time: string;
    barberName?: string;
    status: string;
  }[];
  lastAppointment?: string;
};