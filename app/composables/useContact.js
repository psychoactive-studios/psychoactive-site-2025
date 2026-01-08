import { testClickAnimation } from '~/utils/animations/contact';

const sceneRef = ref(null);
const previousSectionRef = ref(null);
const stepSectionRef = ref(null);
const stepSectionTextRef = ref(null);
const stepMessage = ref('Hi I’m Psycho AI Agent');
const previousMessage = ref(null);
const actionsRef = reactive({
  buttons: null,
  nameForm: null,
});

export default function useContact() {
  const handleTestClick = (e) =>
    testClickAnimation(e, {
      sceneRef,
      previousSectionRef,
      stepSectionRef,
      stepSectionTextRef,
      stepMessage,
      previousMessage,
      actionsRef,
    });

  return {
    sceneRef,
    previousSectionRef,
    stepSectionRef,
    stepSectionTextRef,
    stepMessage,
    previousMessage,
    actionsRef,
    handleTestClick,
  };
}
