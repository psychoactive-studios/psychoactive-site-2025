<script setup>
import Footer from '~/components/layout/Footer.vue';
import LetsTalkDots from '~/components/ui/LetsTalkDots.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { scrollSmoother } = useScrollSmoother();

onMounted(() => {
  setTimeout(() => {
    scrollSmoother.value.paused(false);
  }, 100);
});
</script>
<template>
  <main class="article">
    <div class="article__hero">
      <div class="container">
        <div class="article__hero_grid">
          <div class="article__hero_info">
            <ul>
              <li>Author</li>
              <li>Andrew Hillstead</li>
            </ul>
            <ul>
              <li>DATE</li>
              <li>Dec 4 2025</li>
            </ul>
            <ul>
              <li>TIME</li>
              <li>5 min</li>
            </ul>
          </div>
          <div class="article__hero_title">
            <h1>
              Harnessing the power of community for small Māori businesses
            </h1>
          </div>
        </div>
        <div class="article__hero_image">
          <NuxtImg
            src="/img/test-article-image.jpg"
            sizes="100vw md:70vw xl:1600px"
          />
        </div>
      </div>
    </div>
    <div class="article__body">
      <div class="container">
        <article>
          <h2>
            Small business owners with their sights on the future are
            recognising the value of collaboration.
          </h2>

          <p class="large-body">
            Through the Te Puni Kōkiri Cadetship programme, three creative
            companies are sharing their baskets of knowledge, so their kaimahi
            and businesses can thrive. Watch this video about their
            collaboration.
          </p>
          <p>
            Andrew Hillstead founded Psychoactive Studios digital design agency
            to create beautiful, interactive, user friendly web products and
            experiences. He is now teaming up with cultural storytelling tech
            company VAKA and cultural photography business Soldiers Rd
            Portraits. All three are on the brink of big, bold expansion.
          </p>
          <p>Find out more about Vaka’s basket of knowledge.</p>
          <p>Find out more about Soldiers Rd’s basket of knowledge.</p>

          <div class="image">
            <NuxtImg
              src="/img/test-article-image-2.jpg"
              sizes="100vw md:70vw xl:1600px"
            />
          </div>

          <h2>Knowledge is community</h2>

          <div class="quote">
            <div class="quote__wrapper">
              <blockquote>
                “We want to connect Jesse with my employee Callum Mudgway to
                create a supportive environment where he can grow. Callum’s an
                amazing designer. He now needs to be able to stand with mana and
                strength to present and work with clients every day,”
              </blockquote>
            </div>
            <div class="quote__author">– says Andrew.</div>
          </div>

          <p>
            At the same time, Andrew is sharing his web skills with the owners
            of cultural portrait photography business, Soldiers Rd Portraits.
          </p>
          <p>
            For nearly eight years, sisters-in-law Taaniko and Vienna Nordstrom
            have been styling customers in Māori regalia for indigenous inspired
            vintage portraits that plant a seed of cultural identity and
            integrity. The business is now preparing to expand nationwide.
          </p>
          <p>
            Andrew’s helping us to bring the visual side of our business to life
            in a way that will be perfect for expanding and telling our stories
            explains Taaniko (Ngāti Hine, Ngāti Kahungunu ki Te Wairoa,
            Rongomaiwahine, Waikato-Tainui).
          </p>

          <p class="spacer"></p>

          <h3>Knowledge is community text community text</h3>

          <p>
            At the same time, Andrew is sharing his web skills with the owners
            of cultural portrait photography business, Soldiers Rd Portraits:
          </p>
          <ol>
            <li>
              For nearly eight years, sisters-in-law Taaniko and Vienna
              Nordstrom have been styling customers in Māori regalia for
              indigenous inspired vintage portraits that plant a seed of
              cultural identity and integrity. The business is now preparing to
              expand nationwide.
            </li>
            <li>
              Andrew’s helping us to bring the visual side of our business to
              life in a way that will be perfect for expanding and telling our
              stories” explains Taaniko (Ngāti Hine, Ngāti Kahungunu ki Te
              Wairoa, Rongomaiwahine, Waikato-Tainui).
            </li>
          </ol>
          <p>“He’s showing us how to update our website</p>
          <p>
            He’s showing us how to update our website so that it's fresh,
            modern, showcases our work and gives people an idea of what we do at
            a glance,” agrees Vienna (Ngāti Porou).
          </p>
          <div class="cta">
            <LetsTalkDots mode="light" />
          </div>
          <h6>sub header text</h6>
          <h2>Knowledge is community</h2>
          <p>
            At the same time, Andrew is sharing his web skills with the owners
            of cultural portrait photography business, Soldiers Rd Portraits.
          </p>

          <ul>
            <li>
              For nearly eight years, sisters-in-law Taaniko and Vienna
              Nordstrom have been styling customers in Māori regalia for
              indigenous inspired vintage portraits that plant a seed of
              cultural identity and integrity. The business is now preparing to
              expand nationwide.
            </li>
            <li>
              Andrew’s helping us to bring the visual side of our business to
              life in a way that will be perfect for expanding and telling our
              stories” explains Taaniko (Ngāti Hine, Ngāti Kahungunu ki Te
              Wairoa, Rongomaiwahine, Waikato-Tainui).
            </li>
            <li>
              He’s showing us how to update our website so that it's fresh,
              modern, showcases our work and gives people an idea of what we do
              at a glance,” agrees Vienna (Ngāti Porou).
            </li>
            <li>
              As Cadets, Taaniko and Vienna see Andrew’s support as crucial to
              helping them achieve their business goals.
            </li>
          </ul>
          <div class="image-double">
            <img src="/img/test-article-image-2.jpg" alt="" />
            <img src="/img/news/news-image-3.png" alt="" />
          </div>
          <p>
            At the same time, Andrew is sharing his web skills with the owners
            of cultural portrait photography business, Soldiers Rd Portraits.
          </p>
          <p>
            For nearly eight years, sisters-in-law Taaniko and Vienna Nordstrom
            have been styling customers in Māori regalia for indigenous inspired
            vintage portraits that plant a seed of cultural identity and
            integrity. The business is now preparing to expand nationwide.
          </p>
          <p>
            “Andrew’s helping us to bring the visual side of our business to
            life in a way that will be perfect for expanding and telling our
            stories” explains Taaniko (Ngāti Hine, Ngāti Kahungunu ki Te Wairoa,
            Rongomaiwahine, Waikato-Tainui).
          </p>
          <p>
            “He’s showing us how to update our website so that it's fresh,
            modern, showcases our work and gives people an idea of what we do at
            a glance,” agrees Vienna (Ngāti Porou).
          </p>
          <p>
            As Cadets, Taaniko and Vienna see Andrew’s support as crucial to
            helping them achieve their business goals.
          </p>

          <h2>
            Title H2 Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Quae, praesentium?
          </h2>
          <h3>
            Title H3 Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Quae, praesentium?
          </h3>
          <h4>
            Title H4 Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Quae, praesentium?
          </h4>
          <h5>
            Title H5 Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Quae, praesentium?
          </h5>
        </article>
      </div>
    </div>
    <Footer />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
.article {
  &__hero {
    padding-top: 160px;
    &_grid {
      display: grid;
      grid-template-columns: 1fr 74%;
      gap: getRem(24);
      margin-bottom: 80px;
    }
    &_info {
      & > ul {
        position: relative;
        padding: 15px 0 11px 0;
        display: flex;
        flex-direction: column;
        gap: getRem(12);
        &::before {
          content: '';
          position: absolute;
          top: 1.45rem;
          left: 3px;
          bottom: 1.55rem;
          width: 1px;
          background-color: white(20);
        }
        & > li {
          padding-left: 17px;
          position: relative;
          &::before {
            content: '';
            position: absolute;
            left: 0;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background-color: white(50);
          }
          &:first-child {
            font-family: 'RoobertMono';
            font-weight: 500;
            line-height: 1;
            text-transform: uppercase;
            color: white(50);
            &::before {
              top: 0.3rem;
            }
          }
          &:last-child {
            font-weight: 400;
            line-height: 1.7;
            color: $color-grey;
            &::before {
              top: 0.65rem;
            }
          }
        }
      }
    }
    &_title {
      h1 {
        font-size: getRem(96);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 96px */
        letter-spacing: -5.76px;
      }
    }
    &_image {
      position: relative;
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: -50vw;
        right: -50vw;
        height: 51%;
        background-color: $color-foreground;
        z-index: -1;
      }
      img {
        width: 100%;
        height: auto;
        border-radius: getRem(10);
      }
    }
  }
  &__body {
    background-color: $color-foreground;
    color: $color-background;
    padding-top: 120px;
    padding-bottom: 160px;
    article {
      & > *:first-child {
        margin-top: 0;
      }
      & > *:last-child {
        margin-bottom: 0;
      }
      & > * {
        width: 50%;
        margin-left: auto;
        margin-right: auto;
      }
      h2 {
        margin-bottom: 60px;
        font-size: getRem(64);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 64px */
        letter-spacing: -0.05em;
      }
      h3 {
        margin-bottom: 60px;
        font-size: getRem(56);
        font-style: normal;
        font-weight: 400;
        line-height: 100%;
        letter-spacing: -0.04em;
      }
      h4 {
        margin-bottom: 60px;
        font-size: getRem(48);
        font-style: normal;
        font-weight: 400;
        line-height: 120%;
        letter-spacing: -0.04em;
      }
      h5 {
        margin-bottom: 60px;
        font-size: getRem(40);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 40px */
        letter-spacing: -0.04em;
      }
      h6 {
        font-family: 'RoobertMono';
        font-size: 1rem;
        font-style: normal;
        font-weight: 500;
        line-height: 100%;
        text-transform: uppercase;
        margin-bottom: getRem(12);
      }
      p {
        font-size: getRem(24);
        font-style: normal;
        font-weight: 400;
        line-height: 1.25; /* 125% */
        margin-bottom: getRem(40);
        &.large-body {
          font-size: getRem(32);
          line-height: 112.5%;
        }
      }
      .image {
        margin-top: 120px;
        margin-bottom: 120px;
        width: 100%;
        img {
          width: 100%;
          height: auto;
        }
        &-double {
          margin-top: 120px;
          margin-bottom: 120px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: getRem(20);
          img {
            width: 100%;
            aspect-ratio: 1 / 1;
            object-fit: cover;
          }
        }
      }
      .quote {
        margin-bottom: getRem(60);
        &__wrapper {
          position: relative;
          &::before {
            content: '';
            display: block;
            width: 1px;
            position: absolute;
            top: 0.8rem;
            left: 3px;
            bottom: 0.8rem;
            background-color: $color-background;
            opacity: 0.2;
          }
          blockquote {
            font-size: getRem(38);
            font-style: normal;
            font-weight: 400;
            line-height: 120%; /* 45.6px */
            letter-spacing: -0.04em;
            padding-left: 50px;
            margin-bottom: 48px;
            &::before {
              content: '';
              display: block;
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background-color: $color-background;
              position: absolute;
              top: 0.6rem;
              left: 0;
              opacity: 0.5;
            }
            &::after {
              content: '';
              display: block;
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background-color: $color-background;
              position: absolute;
              bottom: 0.6rem;
              left: 0;
              opacity: 0.5;
            }
          }
        }
        &__author {
          font-family: 'RoobertMono';
          font-size: 1rem;
          font-style: normal;
          font-weight: 500;
          line-height: 100%;
          text-transform: uppercase;
        }
      }
      .spacer {
        overflow: hidden;
      }
      .cta {
        margin-top: 120px;
        margin-bottom: 120px;
      }
      ol,
      ul {
        font-size: getRem(24);
        font-style: normal;
        font-weight: 400;
        line-height: 1.25;
        padding-left: getRem(32);
        li {
          margin-bottom: getRem(40);
        }
      }
      ol {
        list-style-type: decimal;
      }
      ul {
        list-style-type: disc;
      }
    }
  }
}
</style>
