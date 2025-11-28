export type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  appointments: {
    date: string;
    time: string;
    barberName?: string;
    status: string;
    note?: string;
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


export type BookingForm = {
  barberId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  notes: string;
};

export type BarberCard = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: string;
};


export type PromptSection = {
  title: string;
  content: string;
};


export type Barber = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: string;
};

export type BarberException = {
  id: string;
  barberId: string;
  date: string;
  isDayOff: boolean;
  startTime?: string;
  endTime?: string;
};

export type StoreSettings = {
  bannerUrl: string;
  introText: string;
  phoneNumber: string;
  address: string;
  hours: string;
};