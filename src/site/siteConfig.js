// Public-website configuration. Edit this file to update school details
// shown across the marketing pages (header, footer, contact, hero, etc.).
export const siteConfig = {
  schoolName: 'skoolDesk Academy',
  shortName: 'skoolDesk',
  tagline: 'Where curiosity meets character.',
  established: 1998,
  contact: {
    addressLines: ['12 Linden Avenue', 'Greenfield, CA 94120'],
    phone: '+1 (555) 010-2840',
    email: 'hello@skooldesk.example',
    officeHours: 'Mon–Fri · 8:00 AM – 4:30 PM',
  },
  social: [
    { label: 'Facebook', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: 'YouTube', href: '#' },
  ],
  nav: [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Academics', to: '/academics' },
    { label: 'Admissions', to: '/admissions' },
    { label: 'Faculty', to: '/faculty' },
    { label: 'News', to: '/news' },
    { label: 'Contact', to: '/contact' },
  ],
}

export default siteConfig
