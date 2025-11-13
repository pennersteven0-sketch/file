export type Client = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
};

export type TeamMember = {
  id:string;
  name: string;
  role: 'Foreman' | 'Laborer' | 'Finisher' | 'Driver';
  avatarUrl: string;
};

export type Task = {
  id: string;
  description: string;
  completed: boolean;
};

export type JobStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'On Hold';

export type Job = {
  id: string;
  title: string;
  location: string;
  date: Date;
  client: Client;
  team: TeamMember[];
  tasks: Task[];
  status: JobStatus;
  description: string;
};

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected';

export type QuoteItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Quote = {
  id: string;
  quoteNumber: string;
  client: Client;
  date: Date;
  validUntil: Date;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  jobId?: string;
};

export type QuoteFormData = {
  clientName?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  jobDetails?: string | null;
  total: number;
}
