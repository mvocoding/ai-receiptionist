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

export type Message = {
  sender: 'customer' | 'ai' | 'system';
  message: string;
  time: string;
};

export type Comm = {
  id: string;
  type: 'call' | 'sms' | 'recording';
  contactName: string;
  contactNumber: string;
  timestamp: string;
  status: string;
  sentiment?: string;
  tag?: string;
  actionTaken?: string;
  aiSummary?: string;
  meaning?: string;
  conversation?: Message[];
  duration?: number;
  audioUrl?: string;
};


export type Barber = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  price: number;
};

export type BookingForm = {
  barberId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  notes: string;
};