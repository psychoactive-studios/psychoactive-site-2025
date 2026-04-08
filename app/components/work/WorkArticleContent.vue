<script setup>
import WorkTextSection from '../ui/WorkTextSection.vue';
import WorkCTAButton from './WorkCTAButton.vue';
import WorkNumbers from './WorkNumbers.vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  websiteLink: {
    type: String,
    required: false,
    default: '',
  },
});

const getSrcSet = (image) => {
  if (!image?.formats) return '';

  const { small, medium, large } = image.formats;
  const srcSet = [];

  if (small) srcSet.push(`${small.url} ${small.width}w`);
  if (medium) srcSet.push(`${medium.url} ${medium.width}w`);
  if (large) srcSet.push(`${large.url} ${large.width}w`);

  if (image.url && image.width) {
    srcSet.push(`${image.url} ${image.width}w`);
  }

  return srcSet.join(', ');
};
console.log('data', props.data);

</script>

<template>
  <article class="work">
    <template v-for="(block, index) in data" :key="index">
      <!-- Numbers section -->
      <WorkNumbers v-if="block.__component === 'work.stats-grid'" :data="block" />

      <!-- Centered Stat -->
      <WorkCenteredStat  v-if="block.__component === 'work.centered-stat'" :data="block" />

      <!-- Fullwidth Image section -->
      <section
        v-if="block.__component === 'work.fullwidth-image' && !!block.image"
        :class="['work__full-image', { 'work__full-image--with-mobile': block.mobile }]"
      >      
        <video v-if="block.image?.mime === 'video/mp4'" class="work__full-image_video" :src="block.image?.url"
          autoplay
          muted
          loop
          playsinline
        />
        <img
          v-else
            class="work__full-image_image"
            :src="block.image?.url"
            :srcset="getSrcSet(block.image)"
            sizes="100vw"
            alt="Image"
          />
          <img          
            v-if="block.mobile"
            class="work__full-image_mobile-mobile"
            :src="block.mobile?.url"
            :srcset="getSrcSet(block.mobile)"
            sizes="100vw"
            alt="Image"
          />
      </section>

      <!-- Text section -->
      <section
        v-if="block.__component === 'work.text-section'"
        class="work__text-section"
      >
        <div class="container">
          <WorkTextSection :title="block.title">
            {{ block.description }}
          </WorkTextSection>
        </div>
      </section>

      <!-- Quote section -->
      <section
        v-if="block.__component === 'work.quote'"
        class="work__quote-section"
      >
        <div class="container">
          <div class="work__quote-section_text">
            {{ block.text ? block.text.replace(/&nbsp;|\u00A0/g, ' ') : '' }}
          </div>
          <div v-if="block.subTitle" class="work__quote-section_subheader subheader">
            {{ block.subTitle }}
          </div>
        </div>
      </section>

      <!-- Container Image section -->
      <section
        v-if="block.__component === 'work.container-image' && !!block.image"
        :class="['work__full-image', { 'work__full-image--with-mobile': block.mobile }]"
      >
        <div class="container">
          <video v-if="block.image?.mime === 'video/mp4'" class="work__full-image_video" :src="block.image?.url"
          autoplay
          muted
          loop
          playsinline
        />
        <img
          v-else
            class="work__full-image_image"
            :src="block.image?.url"
            :srcset="getSrcSet(block.image)"
            sizes="100vw"
            alt="Image"
          />
          <img          
            v-if="block.mobile"
            class="work__full-image_mobile-mobile"
            :src="block.mobile?.url"
            :srcset="getSrcSet(block.mobile)"
            sizes="100vw"
            alt="Image"
          />
        </div>
      </section>

      <!-- Feedback section -->
      <div v-if="block.__component === 'work.feedback'" class="container">
        <section class="work__feedback">
          <div class="work__feedback_photo">
            <img :src="block.image?.url" :alt="block.image?.name" />
          </div>
          <div class="work__feedback_content">
            <blockquote>
              {{ block.quote }}
            </blockquote>
            <div class="work__feedback_author">
              <span class="work__feedback_author-name">{{ block.name }}</span>
              <span class="work__feedback_author-company">
                {{ block.company }}
              </span>
            </div>
          </div>
        </section>
      </div>

      <!-- Mobile Section -->
      <section
        v-if="block.__component === 'work.mobile-section'"
        class="work__mobile-section"
      >
        <img
          :src="block.mainImage?.url"
          alt="Image-1"
          class="work__mobile-section-image-1"
        />
        <img
          :src="block.image1?.url"
          alt="Image-2"
          class="work__mobile-section-image-2"
        />
        <img
          :src="block.image2?.url"
          alt="Image-2"
          class="work__mobile-section-image-3"
        />
      </section>

      <!-- Media Grid Section -->
      <section
        v-if="block.__component === 'shared.media-grid'"
        class="work__media-grid"
      >
      <div :class="['container', { 'container--mobile': block.oneColumnOnMobile }]">
        <img
          v-for="image in block.mediaGrid"
          :key="image.id"
          :src="image?.url"
          alt="Image-1"
          class="work__media-grid-image"
        />
      </div>
      </section>

      <!-- CTA section -->
       <div v-if="block.__component === 'work.launch-website'">
        <WorkCTAButton
          v-if="block.text"
          :href="block.showButton && websiteLink ? (block.customLink ? block.customLink : websiteLink) : false"
          :buttonText="block.buttonText || 'Launch Website'"
          :textWidth="block.textWidth || 'small'"
        >
          {{ block.text }}
        </WorkCTAButton>
        <WorkCTAButton
          v-else
          :href="block.showButton && websiteLink ? (block.customLink ? block.customLink : websiteLink) : false"
          :buttonText="block.buttonText || 'Launch Website'"
          :textWidth="block.textWidth || 'small'"
        />
       </div>
      
    </template>
  </article>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.work {
  position: relative;
  z-index: 1;
  &__full-image {
    padding: 120px 0;
    @include respond(mobile) {
      padding: 60px 0;
    }
    img, video {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
    &_image {
      display: block;
    }
    &_mobile-mobile {
      display: none;
    }
    &--with-mobile{
      @include respond(mobile) {
        .work__full-image_image {
          display: none;
        }
        .work__full-image_mobile-mobile {
          display: block;
        }
      }
    }
  }
  &__text-section {
    padding: 120px 0;
    @include respond(mobile) {
      padding: 60px 0;
    }
  }
  &__quote-section {
    padding: 120px 0;
    @include respond(mobile) {
      padding: 60px 0;
    }    
    &_text {
      white-space: pre-wrap;
      font-size: max(2.5vw, 32px);
      font-style: normal;
      font-weight: 400;
      line-height: 120%;
      letter-spacing: -0.96px;
      text-align: center;
      max-width: 66.23%;
      margin: 0 auto;
      @include respond(mobile) {
        max-width: initial;
        font-size: 6.4vw;
        letter-spacing: -.48px;
      }
    }
    &_subheader {      
      text-align: center;
      max-width: 66.23%;
      margin: 20px auto 0 auto;
      @include respond(mobile) {
        max-width: initial;
      }
    }
  }
  &__feedback {
    padding: 40px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 120px;
    @include respond(mobile) {
      padding: 20px 0;
      display: block;
    }
    &_photo {
      width: 32.5%;
      flex-shrink: 0;
      img {
        border-radius: 1rem;
      }
      @include respond(mobile) {
        width: auto;
        aspect-ratio: 1;
        margin-bottom: 24px;
        img {
          border-radius: getRem(8);
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    &_content {
      width: 50%;
      @include respond(mobile) {
        width: auto;
      }
      blockquote {
        font-size: 2.085vw;
        font-style: normal;
        font-weight: 400;
        line-height: 110%; /* 110% */
        letter-spacing: -0.05em;
        @include respond(mobile) {
          font-size: 4.27vw;
          font-style: normal;
          font-weight: 400;
          line-height: 140%;
        }
      }
    }
    &_author {
      margin-top: 90px;
      @include respond(mobile) {
        margin-top: 60px;
      }
      &-name {
        font-size: clamp(18px, 1.05vw, 24px);
        font-style: normal;
        font-weight: 500;
        line-height: 120%;
        display: block;
        margin-bottom: 0.63vw;
        @include respond(mobile) {
          font-size: 4.27vw;
          font-style: normal;
          font-weight: 400;
          line-height: 140%;
        }
      }
      &-company {
        font-family: 'RoobertMono';
        font-size: clamp(12px, 0.73vw, 16px);
        font-style: normal;
        font-weight: 500;
        line-height: 120%;
        text-transform: uppercase;
        display: block;
        @include respond(mobile) {
          font-size: max(3.2vw, 12px);
        }
      }
    }
  }

  &__media-grid {
    margin-top: 120px;
    margin-bottom: 120px;
    @include respond(mobile) {
      margin-top: 60px;
      margin-bottom: 60px;
    }
    .container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 32px;
      @include respond(mobile) {
        gap: 16px;
      }
      &--mobile {
        @include respond(mobile) {
          grid-template-columns: 1fr;
        }
      }
    }
    &-image {
      width: 100%;
      height: auto;      
    }
  }
  &__mobile-section {
    margin-top: 120px;
    padding-bottom: 120px;
    position: relative;
    // aspect-ratio: 1.77;
    display: flex;
    justify-content: center;
    gap: 20%;
    @include respond(mobile) {
      margin-top: 90px;
      margin-bottom: 60px;
    }
    &-image-1 {
      position: absolute;
      z-index: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    &-image-2 {
      position: relative;
      // top: 1%;
      // left: 17%;
      width: 25%;
    }
    &-image-3 {
      position: relative;
      top: 120px;
      // right: 17%;
      width: 25%;
    }
  }
}
</style>
