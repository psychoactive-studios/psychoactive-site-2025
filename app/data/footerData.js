import w3AwardsLogo from '/img/W3-awards-logo.png';
import techbehemothsLogo from '/img/Techbehemoths-logo.png';
import cssAwardsLogo from '/img/CSS-Awards-logo.png';
import bestAwardsLogo from '/img/Best-awards-logo.png';
import awwwardsLogo from '/img/Awwwards-logo.png';

export const footerData = {
  links: [
    { title: 'About', url: '/about' },
    { title: 'Work', url: '/work' },
    { title: 'Services', url: '/services' },
    { title: 'Webflow', url: '/webflow-enterprise-agency' },
    { title: 'Content Hub', url: '/content-hub' },
    { title: 'let’s talk', url: '/contact' },
  ],
  // Width/height match the source PNGs in /public/img/. They're
  // baked into the data (not the template) so the browser can reserve
  // each logo's exact box from SSR — Lighthouse flagged the previous
  // height-only CSS as a CLS contributor because each logo's intrinsic
  // aspect ratio wasn't known until the image loaded.
  awards: [
    {
      name: 'Awwwards',
      icon: awwwardsLogo,
      url: 'https://www.awwwards.com/psychoactive-studios/',
      width: 58,
      height: 58,
    },
    {
      name: 'CSS Design Awards',
      icon: cssAwardsLogo,
      url: 'https://www.cssdesignawards.com/search?search_term=psychoactive',
      width: 59,
      height: 53,
    },
    {
      name: 'Best Awards',
      icon: bestAwardsLogo,
      url: 'https://bestawards.co.nz/studios/psychoactive-studios/',
      width: 59,
      height: 58,
    },
    {
      name: 'W3 Awards',
      icon: w3AwardsLogo,
      url: 'https://www.w3award.com/',
      width: 58,
      height: 58,
    },
    {
      name: 'Tech Behemoths',
      icon: techbehemothsLogo,
      url: 'https://techbehemoths.com/company/psychoactive-studios',
      width: 159,
      height: 53,
    },
  ],
};
