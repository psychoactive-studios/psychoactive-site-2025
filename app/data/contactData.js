// config/tadiScript.js

export const tadiSteps = {
  intro: {
    id: 'intro',
    // Масив повідомлень, які йдуть одне за одним
    messages: [
      {
        // Частина 1: Привітання (TADI обирає одну з цих фраз)
        variations: [
          'Hi, I’m TADI — short for Tadpole Artificial Design Intelligence.',
          'Welcome to Psychoactive. I’m TADI — think of me as your digital guide.',
          'Hey, I’m TADI. I don’t bite. I just ask really smart questions.',
        ],
        delayAfter: 800, // Пауза перед наступним повідомленням (мс)
      },
      {
        // Частина 2: Запитання (З'являється після паузи)
        variations: [
          'What brings you to my pond today?',
          'Shall we start a project or join the team?',
          'What would you like to do?',
        ],
        // delayAfter не потрібен, бо далі йдуть кнопки
      },
    ],
    // Тип інпуту (з'являється після останнього повідомлення)
    cta: 'introButtons',
    type: 'buttons',
    sceneShape: 0,
  },

  ask_name: {
    id: 'ask_name',
    messages: [
      {
        variations: [
          'Ah, the start of a new metamorphosis. Let’s see what kind of transformation we’re about to create together.',
        ],
      },
      {
        variations: ['Let’s start simple — what should I call you?'],
      },
    ],
    cta: 'nameForm',
    type: 'textField',
    sceneShape: 1,
    nextStep: 'ask_company_role',
  },

  // Приклад кроку з використанням даних користувача в варіаціях
  ask_company_role: {
    id: 'ask_company_role',
    messages: [
      {
        // Можна передавати функцію, яка повертає масив варіацій
        variations: [
          'Who are you with, and what role do you play in your ecosystem?',
        ],
      },
    ],
    type: 'text_input',
    inputType: 'email',
    model: 'email',
    sceneShape: 2,
    placeholder: 'name@company.com',
    next: 'finish',
  },
};
