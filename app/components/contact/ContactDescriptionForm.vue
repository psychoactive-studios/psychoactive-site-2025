<script setup>
import { useField, useForm } from 'vee-validate';
import { tadiSteps } from '~/data/contactData';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import TextField from '../ui/TextField.vue';
import useContact from '~/composables/useContact';
import LinkButton from '../ui/LinkButton.vue';
import FileUpload from '../ui/FileUpload.vue';

const { userData, currentStepId, handleNextStep } = useContact();

const { handleSubmit, setFieldError } = useForm();

const { value: description, errorMessage } = useField('description', undefined, {
  initialValue: userData.description,
});

const { value: file, errorMessage: fileErrorMessage } = useField('file', undefined, {
  initialValue: [],
});

const hasAttemptedSubmit = ref(false);

// Clear errors reactively once at least one field is filled after a submit attempt
watch([description, file], ([desc, f]) => {
  if (!hasAttemptedSubmit.value) return;

  const hasDescription = !!(desc?.trim());
  const hasFile = Array.isArray(f) ? f.length > 0 : !!f;

  if (hasDescription || hasFile) {
    setFieldError('description', undefined);
    setFieldError('file', undefined);
  } else {
    setFieldError('description', 'Describe your project or upload a file');
    setFieldError('file', 'Upload a file or describe your project');
  }
});

const onSubmit = handleSubmit((values, event) => {  
  userData.description = values.description;
  userData.file = values.file;
  const nextStepId = tadiSteps[currentStepId.value]?.nextStep;
  handleNextStep(nextStepId, event.evt);
});

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function validateAndSubmit(event) {
  hasAttemptedSubmit.value = true;

  const hasDescription = !!(description.value?.trim());
  const files = Array.isArray(file.value) ? file.value : (file.value ? [file.value] : []);
  const hasFile = files.length > 0;

  if (!hasDescription && !hasFile) {
    setFieldError('description', 'Describe your project or upload a file');
    setFieldError('file', 'Upload a file or describe your project');
    return;
  }

  const oversizedFile = files.find(f => f.size > MAX_FILE_SIZE_BYTES);
  if (oversizedFile) {
    setFieldError('file', `File size must not exceed ${MAX_FILE_SIZE_MB}MB`);
    return;
  }

  onSubmit(event);
}
</script>

<template>
  <form class="description-form" @submit.prevent="validateAndSubmit">
    <div class="description-form__inner">
      <TextField
        :rows="4"
        type="textarea"
        v-model="description"
        placeholder="Describe your project"
        class="description-form__input"
        :error-message="errorMessage"
      />
      <FileUpload
        v-model="file"
        name="attachments"
        accept=".pdf"
        :multiple="false"        
        :has-error="!!fileErrorMessage"
        :error-message="fileErrorMessage"
      />
    </div>
    <div class="contact-form__subtext body">If you have a brief already written please fire it through — otherwise notes, bullet points, or rough thoughts are all fine.</div>
    <LinkButton class="description-form__button" size="small">submit</LinkButton>
    <!-- <ButtonDotsArrow direction="right" class="name-form__button" /> -->
  </form>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.description-form {
  width: 100%;
  &__inner {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    gap: getRem(32);
  }
  &__input {
    width: 100%;
  }
  &__button {
    margin-top: 42px;
    @include respond(laptop-small) {
      margin-top: 24px;
    }
  }
  .contact-form__subtext {
    color: white(80);
    display: block;
    margin-top: getRem(48);
  }
}
</style>
