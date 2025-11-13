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
  avatarUrl: string;
};

export type Task = {
  id: string;
  description: string;
  completed: boolean;
};

export type JobStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'On Hold' | 'Completed and Paid';

export type Job = {
  id: string;
  title: string;
  location: string;
  dates: Date[]; // Changed from date to dates
  client: Client;
  team: TeamMember[];
  tasks: Task[];
  status: JobStatus;
  description: string;
  quoteDetails?: Quote; // Optional field to link back to the quote
};

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected';

export type QuoteItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

// Types for quote form data structure
export type Slab = {
  width: number | null;
  length: number | null;
  thickness: number | null;
  rebarSpacing: number | null;
};
export type Footing = {
  length: number | null;
  width: number | null;
  depth: number | null;
  rebarRows: number | null;
};
export type RoundPierHole = {
  count: number | null;
  diameter: number | null;
  depth: number | null;
};
export type SquarePierHole = {
  count: number | null;
  width: number | null;
  length: number | null;
  depth: number | null;
};
export type TravelCost = {
  trips: number | null;
  trucks: number | null;
  miles: number | null;
};
export type Labor = {
  employees: number | null;
  days: number | null;
  costPerDay: number | null;
};
export type Equipment = {
  name?: string;
  daysUsed: number | null;
  pricePerDay: number | null;
};
export type OtherExpense = {
  name?: string;
  cost: number | null;
  costPerSqFt: number | null;
};
export type QuoteCosts = {
  concretePrice: number | null;
  rebarPrice: number | null;
  travelPrice: number | null;
};
export type QuoteProfit = {
  fixedAmount: number | null;
  perSquareFoot: number | null;
};

export type QuoteFormData = {
  jobDetails?: string;
  slabs?: Slab[];
  footings?: Footing[];
  roundPierHoles?: RoundPierHole[];
  squarePierHoles?: SquarePierHole[];
  travelCosts?: TravelCost[];
  labor?: Labor[];
  equipment?: Equipment[];
  otherExpenses?: OtherExpense[];
  costs?: QuoteCosts;
  profit?: QuoteProfit;
}

export type Quote = {
  id: string;
  quoteNumber: string;
  client: Client;
  dates: Date[];
  validUntil: Date;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  formData?: QuoteFormData; // To store the form state
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  jobId?: string;
};
