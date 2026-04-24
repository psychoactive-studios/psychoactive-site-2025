import awwwardsLogo from '/img/featured/awwwards.png';
import cssDesignAwardsLogo from '/img/featured/css-design-awards.png';
import webflowLogo from '/img/featured/webflow.svg';
import techBehemothsLogo from '/img/featured/tech-behemoths.png';
import orpetronLogo from '/img/featured/orpetron.png';
import museLogo from '/img/featured/muse.png';
import w3Logo from '/img/featured/w3.png';
import bestAwardsLogo from '/img/featured/best-awards.png';

// Order is optimised for visual balance — Awwwards and Webflow anchor
// the centre, with wide bookends (Muse, CSS Design Awards) at the ends.
// Rhythm alternates wide / medium / narrow so no two adjacent logos
// share the same visual texture.
export const featuredInData = [
  {
    id: 'featured-muse',
    name: 'Muse',
    logo: museLogo,
  },
  {
    id: 'featured-best-design-awards',
    name: 'Best Design Awards',
    logo: bestAwardsLogo,
    label: 'DESIGN AWARDS',
  },
  {
    id: 'featured-tech-behemoths',
    name: 'Tech Behemoths',
    logo: techBehemothsLogo,
  },
  {
    id: 'featured-awwwards',
    name: 'Awwwards',
    logo: awwwardsLogo,
  },
  {
    id: 'featured-webflow',
    name: 'Webflow',
    logo: webflowLogo,
  },
  {
    id: 'featured-w3-awards',
    name: 'W3 Awards',
    logo: w3Logo,
    label: 'AWARDS',
  },
  {
    id: 'featured-orpetron',
    name: 'Orpetron',
    logo: orpetronLogo,
  },
  {
    id: 'featured-css-design-awards',
    name: 'CSS Design Awards',
    logo: cssDesignAwardsLogo,
  },
];
