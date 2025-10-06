<script setup>
import { footerData } from '~/data/footerData';
import PlusIcon from '~/assets/icons/icon-plus.svg';
import LinkWithHover from '../ui/LinkWithHover.vue';
</script>

<template>
  <footer class="footer">
    <section class="navigation">
      <ul class="links">
        <template v-for="(link, index) in footerData.links" :key="link.title">
          <li class="link">
            <LinkWithHover :href="link.url">{{ link.title }}</LinkWithHover>
          </li>
          <li v-if="index < footerData.links.length - 1" class="separator" />
        </template>
      </ul>
    </section>
    <section class="brief">
      <div class="brief__idea">
        <div class="brief__idea_plus">
          <PlusIcon />
          <PlusIcon />
        </div>
        <div class="brief__idea_text">Have an idea?</div>
        <div class="brief__idea_plus">
          <PlusIcon />
          <PlusIcon />
        </div>
      </div>
      <div class="brief__title">Brief our <span>AI</span> agent</div>
      <div class="brief__email">
        Or email the old fashioned way:
        <LinkWithHover href="mailto:hello@psychoactive.co.nz">
          hello@psychoactive.co.nz
        </LinkWithHover>
      </div>
    </section>

    <section class="awards">
      <ul class="awards__list">
        <li v-for="award in footerData.awards" :key="award.name">
          <a :href="award.url" target="_blank">
            <NuxtImg :src="award.icon" :alt="award.name" height="28" />
          </a>
        </li>
      </ul>
      <div class="awards__label">
        <a href="https://webflow.com/@Psychoactive-Studios" target="_blank">
          <img src="/img/Webflow_label.svg" alt="" />
        </a>
      </div>
    </section>
  </footer>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
.footer {
  height: 100vh;
  padding-top: getRem(60);
  padding-bottom: getRem(48);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  .navigation {
    .links {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: getRem(24);
      padding: 0 $main-padding;
      .link {
        font-family: 'RoobertMono', sans-serif;
        text-transform: uppercase;
        a {
          display: block;
        }
      }
      .separator {
        flex-grow: 1;
        height: 1px;
        background-color: white(20);
        position: relative;
        &::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -4px;
          width: 7px;
          height: 7px;
          background-color: white(50);
          border-radius: 50%;
        }
        &::after {
          content: '';
          position: absolute;
          top: -3px;
          right: -4px;
          width: 7px;
          height: 7px;
          background-color: white(50);
          border-radius: 50%;
        }
      }
    }
  }

  .brief {
    font-size: getRem(24);
    line-height: 1.16;
    color: white(50);
    &__idea {
      display: flex;
      align-items: center;
      justify-content: center;
      &_plus {
        display: flex;
        align-items: center;
        width: getRem(140);
        justify-content: space-between;
        & > svg {
          width: getRem(7);
          height: getRem(7);
        }
      }
      &_text {
        margin: 0 getRem(84);
      }
    }

    &__title {
      font-size: 12.448vw;
      line-height: 1.16;
      letter-spacing: getRem(-16);
      color: white(20);
      text-align: center;
      margin: 0 0 getRem(80) 0;
      span {
        color: white(100);
        position: relative;
        &::after {
          content: '';
          position: absolute;
          bottom: getRem(24);
          left: 0;
          width: 100%;
          border-bottom: 1px dashed white(100);
        }
      }
    }

    &__email {
      text-align: center;
      a {
        color: white(100);
      }
    }
  }

  .awards {
    display: flex;
    justify-content: space-between;
    padding: 0 getRem(48);
    &__list {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: getRem(108);
      li {
        a {
          opacity: 0.5;
        }
      }
    }
    &__label {
      & > img {
        height: 48px;
        width: auto;
      }
    }
  }
}
</style>
