import superAiLogo from '/img/partners/super-ai.svg';
import adidasLogo from '/img/partners/adidas.svg';
import rayWhiteLogo from '/img/partners/ray-white.png';
import hellboyLogo from '/img/partners/hellboy.svg';
import blackbirdLogo from '/img/partners/blackbird.svg';
import wowLogo from '/img/partners/wow.svg';
import oneLogo from '/img/partners/one.png';
import allBlacksLogo from '/img/partners/all-blacks.svg';
import burgerfuelLogo from '/img/partners/burgerfuel.png';
import summerGameLogo from '/img/partners/summer-game.png';
import token2049Logo from '/img/partners/token-2049.svg';

// `name` is the human-friendly client name. `alt` is the descriptive
// alt text used on the logo image — written so crawlers and screen
// readers understand each logo represents a real client of Psychoactive
// Studios, not a generic mark.
//
// `featured: true` puts a logo in the homepage hero strip. Trimmed to
// the most internationally recognisable marks so the row reads cleanly
// and doesn't compete with the stats section underneath. The full list
// stays available here for other surfaces that want every client.
//
// Order in this array drives the visual order in the homepage strip.
// Sequenced so wide and compact logos alternate — keeps the row from
// feeling lopsided.
export const partnersData = [
  {
    id: 'partner-adidas',
    name: 'Adidas',
    alt: 'Adidas client logo',
    logo: adidasLogo,
    featured: true,
  },
  {
    id: 'partner-hellboy',
    name: 'Hellboy',
    alt: 'Hellboy client logo',
    logo: hellboyLogo,
    featured: true,
  },
  {
    id: 'partner-all-blacks',
    name: 'All Blacks',
    alt: 'All Blacks client logo',
    logo: allBlacksLogo,
    featured: true,
  },
  {
    id: 'partner-wow',
    name: 'World of WearableArt',
    alt: 'World of WearableArt client logo',
    logo: wowLogo,
    featured: true,
  },
  {
    id: 'partner-blackbird',
    name: 'Blackbird VC',
    alt: 'Blackbird VC client logo',
    logo: blackbirdLogo,
    featured: true,
  },
  {
    id: 'partner-super-ai',
    name: 'Super AI',
    alt: 'SuperAI client logo',
    logo: superAiLogo,
    featured: true,
  },
  {
    id: 'partner-token-2049',
    name: 'Token2049',
    alt: 'Token2049 client logo',
    logo: token2049Logo,
    featured: true,
  },

  // Non-featured: still in the full client list, just not surfaced on
  // the homepage hero strip.
  {
    id: 'partner-ray-white',
    name: 'Ray White',
    alt: 'Ray White client logo',
    logo: rayWhiteLogo,
    featured: false,
  },
  {
    id: 'partner-one',
    name: 'One NZ',
    alt: 'One NZ client logo',
    logo: oneLogo,
    featured: false,
  },
  {
    id: 'partner-burgerfuel',
    name: 'BurgerFuel',
    alt: 'BurgerFuel client logo',
    logo: burgerfuelLogo,
    featured: false,
  },
  {
    id: 'partner-summer-game',
    name: 'Summer Game Fest',
    alt: 'Summer Game Fest client logo',
    logo: summerGameLogo,
    featured: false,
  },
];

// Featured-only subset for the homepage hero strip. Other surfaces
// (e.g. the about page or future "all clients" pages) can still use
// the full `partnersData` export.
export const featuredPartnersData = partnersData.filter((p) => p.featured);
