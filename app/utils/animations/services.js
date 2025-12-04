import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

export const servicesListAnimation = (ctx, root) => {
  SplitText.create(
    '.services-list__item_title, .services-list__item_description',
    {
      type: 'words,chars',
      charsClass: 'char-center',
    }
  );
  ctx.add(() => {
    gsap.to(document.querySelector('.services-list__video_player'), {
      clipPath: 'circle(50% at 50% 50%)',
      duration: 1,
      scrollTrigger: {
        trigger: root,
        start: 'top center',
        end: () => `${window.innerHeight * 0.5} center`,
        scrub: true,
      },
    });

    gsap.utils.toArray('.services-list__item').forEach((item) => {
      const title = item.querySelectorAll(
        '.services-list__item_title .char-center'
      );
      const description = item.querySelectorAll(
        '.services-list__item_description  .char-center'
      );
      const line = item.querySelector('.services-list__item_divider .line');

      gsap
        .timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top center',
            end: 'bottom center',
            markers: true,
          },
        })
        .to(
          title,
          {
            duration: 2.3,
            scrambleText: {
              text: '{original}',
              chars: 'uppercase',
              tweenLength: false,
            },
          },
          '<+=0.2'
        )
        .from(
          title,
          {
            opacity: 0,
            duration: 0.01,
            stagger: {
              amount: 0.9,
              from: 'random',
            },
          },
          '<'
        )
        .from(line, { opacity: 0, duration: 0.5 }, '<+=0.5')
        .fromTo(
          line,
          { width: '0%' },
          { width: '100%', duration: 1.2, ease: 'power4.inOut' },
          '<+=0.2'
        )
        .from(
          description,
          {
            opacity: 0,
            duration: 0.0001,
            stagger: 0.015,
          },
          '-=0.75'
        );
    });
    // ScrollTrigger.create({
    //   trigger: '.services-list',
    //   start: 'top center',
    //   end: 'bottom center',
    //   markers: true,
    // });
  });
};
