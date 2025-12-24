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
    { title: 'Webflow', url: '/webflow' },
    { title: 'Content Hub', url: '/content-hub' },
    { title: 'let’s talk', url: '/' },
  ],
  awards: [
    {
      name: 'Awwwards',
      icon: awwwardsLogo,
      url: 'https://www.awwwards.com/psychoactive-studios/',
    },
    {
      name: 'CSS Design Awards',
      icon: cssAwardsLogo,
      url: 'https://www.cssdesignawards.com/search?search_term=psychoactive',
    },
    {
      name: 'Best Awards',
      icon: bestAwardsLogo,
      url: 'https://bestawards.co.nz/studios/psychoactive-studios/',
    },
    {
      name: 'W3 Awards',
      icon: w3AwardsLogo,
      url: 'https://www.w3award.com/',
    },
    {
      name: 'Tech Behemoths',
      icon: techbehemothsLogo,
      url: 'https://techbehemoths.com/company/psychoactive-studios',
    },
  ],
};
