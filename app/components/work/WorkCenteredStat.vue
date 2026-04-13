<script setup>
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

const numbersRef = ref(null);

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const { text, title, size = 'large' } = props.data;

let ctx = null;
let tl = null;



const initAnimation = () => {  
  if (!numbersRef.value) return; 

  SplitText.create('.centered-stat__number', {
    type: 'words, chars',
    charsClass: 'char-center',
  });

  // Kill previous timeline if exists
  if (tl) tl.kill();

  ctx = gsap.context(() => {
    tl = gsap.timeline({
      scrollTrigger: {
        trigger: numbersRef.value,
        start: 'top bottom',
        end: 'bottom center',
      },
    });

    tl.from(
      '.centered-stat__item',
      {
        opacity: 0,
        duration: 1.5,
      },
      'start'
    );
    tl.to(
      '.centered-stat__number .char-center',
      {
        duration: 3.5,
        scrambleText: {
          text: '{original}',
          chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
          tweenLength: false,
        },
      },
      'start'
    )
    .from('.centered-stat__number .char-center', {
      opacity: 0,
      duration: 0.01,
      stagger: {
        amount: 1,
        from: 'random',
      },
    }, 'start');

    tl.fromTo(
      '.centered-stat__title-text',
      { clipPath: 'inset(0% 50%)' },
      {
        clipPath: 'inset(0% 0%)',
        duration: 1,
        stagger: 0.1,
        ease: 'power2.in',
      },
      'start'
    ).fromTo(
      '.centered-stat__title-line .line',
      { width: '0%' },
      { width: '100%', duration: 1, stagger: 0.1, ease: 'power2.out' },
      'start+=0.8'
    );
  }, numbersRef.value);
  

  

  // tl.fromTo(
  //   '.centered-stat__title-text',
  //   { clipPath: 'inset(0 100% 0 0)' },
  //   {
  //     clipPath: 'inset(0 0% 0 0)',
  //     duration: 1,
  //     stagger: 0.1,
  //     ease: 'power2.in',
  //   },
  //   'start'
  // ).fromTo(
  //   '.work__numbers_title-line .line',
  //   { width: '0%' },
  //   { width: '100%', duration: 1, stagger: 0.1, ease: 'power2.out' },
  //   'start+=0.8'
  // );
};

watch(
  () => props.data,
  (newData) => {
    if (newData) {      
      setTimeout(() => {
        initAnimation();        
      }, 1000);      
    }
  },
  { immediate: true, deep: true }
);

// onMounted(() => {
//   initAnimation();
// });

onUnmounted(() => {
  if (tl) tl.kill();
});
</script>

<template>
  <section ref="numbersRef" :class="['centered-stat', { 'centered-stat--small': size === 'small' }]">
    <div class="container">
      <div class="centered-stat__item">
        <div class="centered-stat__number">            
          {{ text }}
        </div>
        <div class="centered-stat__title">
          <div class="centered-stat__title-line">
            <span class="line" />
          </div>
          <div class="centered-stat__title-text"> {{ title }}</div>
          <div class="centered-stat__title-line">
            <span class="line" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.centered-stat {
  padding: 120px 0;
  text-align: center;
  @include respond(mobile) {
    padding: 60px 0;
    position: relative;
  }
  &--small {
    .centered-stat__number {        
      font-size: max(4.275vw, 48px);
      font-style: normal;
      font-weight: 400;
      line-height: 110%; /* 90.2px */
      letter-spacing: -0.06em;
    }
  }  
  &__number {
    font-size: max(6.25vw, 64px);
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: -0.06em;
    @include respond(mobile) {
      font-size: 11.2vw;
      font-style: normal;
      font-weight: 400;
      line-height: 121%; /* 50.82px */
      letter-spacing: -0.22vw;
    }
  }
  &__title {
    margin-top: 3.23vw;
    display: flex;
    gap: getRem(28);
    @include respond(mobile) {
      margin-top: 0;
      justify-content: center;
    }
    &-text {
      font-family: 'RoobertMono';
      font-size: max(0.833333vw, 14px);
      font-style: normal;
      font-weight: 500;
      line-height: 100%; /* 16px */
      text-transform: uppercase;
    }
    &-line {
      flex-grow: 1;
      align-self: center;
      @include respond(mobile) {
        display: none;        
      }
      &:first-of-type {
        .line {
          margin-left: auto;
        }        
      }
      &:last-of-type {
        .line {
          margin-right: auto;
        }
      }
      .line {
        display: block;
        height: 1px;
        background: rgba(0, 0, 0, 0.1);
        position: relative;
        will-change: width;        
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
        }
        &::before {
          top: -3px;
          left: -3px;
        }
        &::after {
          top: -3px;
          right: -4px;
        }
      }
    }
  }
}
</style>
