import type { Job, Quote, Client, TeamMember, Notification } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getAvatar = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return img ? img.imageUrl : 'https://picsum.photos/seed/default/100/100';
}

export const clients: Client[] = [
  { id: 'cli-1', name: 'Oakridge Properties', contactPerson: 'John Smith', phone: '555-1234', email: 'john@oakprop.com' },
  { id: 'cli-2', name: 'Summit Homes', contactPerson: 'Jane Doe', phone: '555-5678', email: 'jane@summithomes.com' },
];

export const teamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Mike Johnson', role: 'Foreman', avatarUrl: getAvatar('avatar1') },
  { id: 'tm-2', name: 'Carlos Gomez', role: 'Finisher', avatarUrl: getAvatar('avatar2') },
  { id: 'tm-3', name: 'David Chen', role: 'Laborer', avatarUrl: getAvatar('avatar3') },
  { id: 'tm-4', name: 'Alex Rodriguez', role: 'Driver', avatarUrl: getAvatar('avatar4') },
  { id: 'tm-5', name: 'Sam Wilson', role: 'Laborer', avatarUrl: getAvatar('avatar5') },
];

export const jobs: Job[] = [
  {
    id: 'job-1',
    title: 'Driveway for Lot 24',
    location: '123 Maple St, Springfield',
    date: new Date(new Date().setDate(new Date().getDate())),
    client: clients[0],
    team: [teamMembers[0], teamMembers[1], teamMembers[2]],
    tasks: [
      { id: 'task-1-1', description: 'Excavate and grade the area', completed: true },
      { id: 'task-1-2', description: 'Set up formwork', completed: true },
      { id: 'task-1-3', description: 'Pour concrete', completed: false },
      { id: 'task-1-4', description: 'Finish and cure', completed: false },
    ],
    status: 'In Progress',
    description: `Residential driveway pour for a new construction home. Area is approximately 600 sq ft. Needs a standard broom finish. Ensure proper slope for drainage away from the garage. Client wants expansion joints every 10 feet.`,
  },
  {
    id: 'job-2',
    title: 'Patio for Summit Homes Model',
    location: '456 Oak Ave, Shelbyville',
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    client: clients[1],
    team: [teamMembers[0], teamMembers[3], teamMembers[4]],
    tasks: [
      { id: 'task-2-1', description: 'Prepare sub-base', completed: false },
      { id: 'task-2-2', description: 'Install rebar grid', completed: false },
      { id: 'task-2-3', description: 'Pour and stamp concrete', completed: false },
    ],
    status: 'Scheduled',
    description: `Stamped concrete patio (Ashlar Slate pattern) for a model home. Approx 400 sq ft. Color hardener to be used (light gray). Job needs to be pristine as it will be for showcasing.`,
  },
  {
    id: 'job-3',
    title: 'Foundation for Oakridge Spec Home',
    location: '789 Pine Ln, Capital City',
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    client: clients[0],
    team: [teamMembers[0], teamMembers[1], teamMembers[2], teamMembers[4]],
    tasks: [],
    status: 'Scheduled',
    description: 'Pour a 2000 sq ft basement foundation for a new spec home. Includes footings and 8ft walls. All rebar and formwork will be inspected prior to pour. A pump truck will be required.',
  },
    {
    id: 'job-4',
    title: 'Sidewalk Repair',
    location: 'Main St & 2nd Ave Intersection',
    date: new Date(new Date().setDate(new Date().getDate() - 10)),
    client: { id: 'cli-3', name: 'City of Springfield', contactPerson: 'Tom Public', phone: '555-0011', email: 'publicworks@springfield.gov'},
    team: [teamMembers[1], teamMembers[2]],
    tasks: [
      { id: 'task-4-1', description: 'Demo and remove broken sidewalk sections', completed: true },
      { id: 'task-4-2', description: 'Prep and form new sections', completed: true },
      { id: 'task-4-3', description: 'Pour and finish', completed: true },
    ],
    status: 'Completed',
    description: `Repair 3 sections of public sidewalk. Total of 150 sq ft. Match existing city standard broom finish. High-traffic area, requires proper barricades and safety measures.`,
  },
];

export const quotes: Quote[] = [
  {
    id: 'quote-1',
    quoteNumber: 'Q-2024-001',
    client: clients[1],
    date: new Date(new Date().setDate(new Date().getDate() - 20)),
    validUntil: new Date(new Date().setDate(new Date().getDate() + 10)),
    items: [
      { description: 'Concrete Material (4000 PSI)', quantity: 12, unitPrice: 180, total: 2160 },
      { description: 'Labor - Prep & Pour', quantity: 40, unitPrice: 65, total: 2600 },
      { description: 'Rebar & Formwork Rental', quantity: 1, unitPrice: 500, total: 500 },
    ],
    subtotal: 5260,
    tax: 420.80,
    total: 5680.80,
    status: 'Accepted',
  },
  {
    id: 'quote-2',
    quoteNumber: 'Q-2024-002',
    client: clients[0],
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    validUntil: new Date(new Date().setDate(new Date().getDate() + 25)),
    items: [
      { description: 'Concrete Material (3500 PSI)', quantity: 8, unitPrice: 170, total: 1360 },
      { description: 'Labor - Driveway', quantity: 24, unitPrice: 65, total: 1560 },
    ],
    subtotal: 2920,
    tax: 233.60,
    total: 3153.60,
    status: 'Sent',
  },
];

export const notifications: Notification[] = [
    {
        id: 'notif-1',
        title: 'Job Updated: Driveway for Lot 24',
        description: 'Status changed to "In Progress".',
        date: new Date(new Date().setHours(new Date().getHours() - 2)),
        read: false,
        jobId: 'job-1'
    },
    {
        id: 'notif-2',
        title: 'New Job Scheduled',
        description: 'Patio for Summit Homes Model has been scheduled for 3 days from now.',
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        read: false,
        jobId: 'job-2'
    },
    {
        id: 'notif-3',
        title: 'Quote Accepted!',
        description: 'Quote Q-2024-001 for Summit Homes has been accepted.',
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        read: true,
    },
        {
        id: 'notif-4',
        title: 'Team Member Assigned',
        description: 'You have been assigned to "Foundation for Oakridge Spec Home".',
        date: new Date(new Date().setDate(new Date().getDate() - 3)),
        read: true,
        jobId: 'job-3'
    }
]
