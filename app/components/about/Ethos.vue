<template>
  <div class="our-ethos">
    <div class="our-ethos__title">
      <div class="container">
        <h2>Our Ethos</h2>
      </div>
    </div>
    <div class="container">
      <ol class="our-ethos__list">
        <li class="our-ethos__list_item">
          <div class="item-line">
            <span class="line" />
          </div>
          <div class="item-grid">
            <h3 class="item-title">Put the customer first</h3>
            <div class="item-text">
              We begin by understanding your audience, their needs, habits and
              motivations to create experiences that feel natural, human and
              meaningful.
            </div>
          </div>
        </li>
        <li class="our-ethos__list_item">
          <div class="item-line">
            <span class="line" />
          </div>
          <div class="item-grid">
            <h3 class="item-title">Know where to innovate</h3>
            <div class="item-text">
              We innovate with purpose, combining design fundamentals with fresh
              thinking to create work that feels timeless, focused and original.
            </div>
          </div>
        </li>
        <li class="our-ethos__list_item">
          <div class="item-line">
            <span class="line" />
          </div>
          <div class="item-grid">
            <h3 class="item-title">Technical excellence</h3>
            <div class="item-text">
              We build with precision and care, ensuring every detail,
              micro-interaction and integration is optimised for performance,
              accessibility and reliability.
            </div>
          </div>
        </li>
        <li class="our-ethos__list_item">
          <div class="item-line">
            <span class="line" />
          </div>
          <div class="item-grid">
            <h3 class="item-title">Partnership mindset</h3>
            <div class="item-text">
              We see every collaboration as a shared journey. By aligning our
              expertise with your goals, we create momentum that drives lasting
              growth for both brand and business.
            </div>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
.our-ethos {
  &__title {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    .container {
      margin-top: auto;
    }
    h2 {
      font-size: 14.585vw;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: -0.07em;
    }
  }
  &__list {
    margin-top: 160px;
    display: flex;
    flex-direction: column;
    gap: getRem(48);
    counter-reset: list;
    list-style: none;

    &_item {
      counter-increment: list;

      .item-title {
        display: flex;
        align-items: flex-start;
        gap: getRem(24);

        &::before {
          content: counter(list, decimal-leading-zero);
          font-family: 'RoobertMono';
          font-size: getRem(12);
          font-style: normal;
          font-weight: 500;
          line-height: 72%;
          text-transform: uppercase;
          color: white(50);
          margin-top: getRem(12);
        }
      }
    }

    &_item {
      .item-line {
        flex-grow: 1;
        .line {
          display: block;
          width: 100%;
          height: 1px;
          background: white(10);
          position: relative;
          will-change: width;
          margin-bottom: getRem(24);
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
      .item-grid {
        display: flex;
        justify-content: space-between;
        gap: getRem(48);
      }
      .item-title {
        font-size: 2.5vw;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 57.6px */
        letter-spacing: -0.02em;
      }
      .item-text {
        max-width: 33.3%;
        margin-right: 7%;
        font-size: 1.042vw;
        font-style: normal;
        font-weight: 400;
        line-height: 130%; /* 26px */
        color: white(80);
      }
    }
  }
}
</style>
