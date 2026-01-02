<script setup>
import gsap from 'gsap';
import useScrollSmoother from '@/composables/useScrollSmoother';
import LinkButton from '~/components/ui/LinkButton.vue';
import NotFoundDots from '~/components/ui/NotFoundDots.vue';

const { scrollSmoother } = useScrollSmoother();

onMounted(async () => {
  useRouter().replace('/not-found');
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  await nextTick();
  gsap.set(layoutElements, { scale: 1, opacity: 1 });
  scrollSmoother.value.start();
});
</script>
<template>
  <div class="container">
    <main class="not-found">
      <article class="not-found__article">
        <!-- <LinkButton href="/" class="work__cta_button">
          Back to home
        </LinkButton> -->
        <ClientOnly>
          <NotFoundDots class="not-found__article_button" />
        </ClientOnly>
      </article>
      <aside>
        <div class="not-found__cta">
          <div class="not-found__cta_line">
            <span class="line" />
          </div>
          <LinkButton href="/" class="not-found__cta_button">
            Launch Website
          </LinkButton>
          <div class="not-found__cta_line">
            <span class="line" />
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.not-found {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 56px 0 48px 0;
  &__article {
    flex-grow: 1;
    @include flex-center;
    &_button {
      width: 90%;
    }
  }
  &__cta {
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

    &_button {
      width: 240px;
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
        background: white(10);
        position: relative;
        will-change: width;
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: white(50);
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
