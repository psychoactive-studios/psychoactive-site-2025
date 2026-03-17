export const navigationData = [
  { id: 'about', title: 'About', url: '/about', loader: true },
  { id: 'work', title: 'Work', url: '/work', loader: false },
  { id: 'services', title: 'Services', url: '/services', loader: true },
  { id: 'webflow', title: 'Webflow', url: '/webflow-enterprise-agency', loader: true },
  {
    id: 'content',
    title: 'Content',
    url: '/content-hub',
    loader: false,
    sup: 'Hub',
  },
  { id: 'contact', title: 'let’s talk', url: '/contact', loader: true, hidden: true },
];
