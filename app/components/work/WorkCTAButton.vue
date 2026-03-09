<script setup>
import gsap from 'gsap';
import LinkButton from '../ui/LinkButton.vue';

let ctx;
const containerRef = ref(null);

const props = defineProps({
  href: {
    type: String,
    required: false,
    default: '',
  },
  buttonText: {
    type: String,
    required: false,
    default: 'Launch Website',
  },
});

const { href, buttonText } = props;

onMounted(() => {
  ctx = gsap.context(() => {
    const letsButton = containerRef?.value?.querySelector('.work__cta_button');
    const letsButtonText = containerRef?.value?.querySelector(
      '.work__cta_button .link-button__visible-text'
    );

    const letsBlock = gsap.utils.toArray(
      containerRef?.value?.querySelectorAll('.work__cta_navigation')
    );

    const letsLines = gsap.utils.toArray(
      containerRef?.value?.querySelectorAll('.work__cta_line .line')
    );

    gsap
      .timeline({
        scrollTrigger: {
          trigger: containerRef.value,
          start: 'top 30%',
          end: 'bottom 30%',
        },
      })
      .from(
        letsBlock,
        {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
        },
        'step1'
      )
      .from(
        letsButton,
        { scaleX: 0, duration: 0.5, ease: 'power2.in' },
        'step1+=0.15'
      )
      .to(
        letsButton,
        {
          clipPath: 'inset(0% 0% round 64px)',
          duration: 1,
          ease: 'power2.out',
        },
        '>'
      )
      .from(letsLines, { width: '0%', duration: 1, ease: 'power3.inOut' }, '<')
      .to(
        letsButtonText,
        {
          duration: 1,
          ease: 'none',
          scrambleText: {
            text: '{original}',
            chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
            tweenLength: false,
          },
        },
        '<'
      );
  }, containerRef.value);
});

onUnmounted(() => {
  ctx.revert();
});
</script>

<template>
  <!-- CTA section -->
  <section ref="containerRef" class="work__cta">
    <div class="container">
      <h2 class="work__cta_title">
        <slot />
      </h2>

      <div v-if="href" class="work__cta_navigation">
        <div class="work__cta_line">
          <span class="line" />
        </div>
        <LinkButton :href="href" mode="dark" class="work__cta_button">
          {{ buttonText }}
        </LinkButton>
        <div class="work__cta_line">
          <span class="line" />
        </div>
      </div>
    </div>
  </section>
</template>
<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
.work__cta {
  padding: 120px 0 160px 0;
  @include respond(mobile) {
    padding: 60px 0;
  }
  &_title {
    width: 50%;
    margin: auto;
    font-size: 2.5vw;
    font-style: normal;
    font-weight: 400;
    line-height: 120%;
    letter-spacing: -0.02em;
    text-align: center;
    margin-bottom: 74px;
    @include respond(mobile) {
      width: auto;
      font-size: max(6.4vw, 24px);
      font-style: normal;
      font-weight: 400;
      line-height: 121%;
      letter-spacing: -0.02em;
      margin-bottom: 12.8vw;
    }
  }
  &_button {
    // width: 222px;
    clip-path: inset(0% 35% round 64px);
  }
  &_navigation {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-column: span 2 / span 2;
    grid-row-start: 2;
    align-items: center;
    gap: 48px;
    @include respond(mobile) {
      display: block;
      text-align: center;
    }
  }
  &_line {
    @include respond(mobile) {
      display: none;
    }
    &:first-child {
      .line {
        margin-left: auto;
      }
    }
    .line {
      display: block;
      width: 100%;
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
</style>
