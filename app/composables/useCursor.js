import { usePointer } from '@vueuse/core';

const { x: pointerX, y: pointerY, pointerType } = usePointer();

const cursorRef = ref();
const cursorText = ref('');

export default function useCursor() {
  return {
    pointerX,
    pointerY,
    cursorRef,
    cursorText,
    pointerType,
  };
}
