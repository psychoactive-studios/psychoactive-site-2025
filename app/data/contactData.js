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

  // Start a Project Flow
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
    // confirmMessages: [
    //   {
    //     variations: [
    //       'Nice to meet you, [Name]. You look like someone ready for transformation.',
    //     ],
    //   },      
    // ],
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
        variations: [
          'Nice to meet you, [Name]. You look like someone ready for transformation.',
        ],
      },
      {
        // Можна передавати функцію, яка повертає масив варіацій
        variations: [
          'Who are you with, and what role do you play in your ecosystem?',
        ],
      },
    ],
    cta: 'roleForm',
    type: 'textField',        
    sceneShape: 2,    
    nextStep: 'ask_project_goal',
  },

  ask_project_goal: {
    id: 'ask_project_goal',
    messages: [
      {        
        variations: [
          'Got it. What kind of transformation are you after?',
        ],
      },
    ],
    // confirmMessages: [
    //   {
    //     variations: [
    //       'A classic metamorphosis. I like your style.',
    //     ],
    //   },
    // ],
    cta: 'goalButtons',
    type: 'buttons',        
    sceneShape: 3,    
    nextStep: 'ask_budget',
  },

  ask_budget: {
    id: 'ask_budget',
    messages: [
      {
        variations: [
          'A classic metamorphosis. I like your style.',
        ],
      },
      {        
        variations: [
          'Let’s talk resources — every good metamorphosis needs the right nutrients.',
        ],
      },
    ],
    // confirmMessages: [
    //   {
    //     variations: [
    //       'Perfect. That’s enough energy to evolve something extraordinary.',
    //     ],
    //   },
    // ],
    cta: 'budgetButtons',
    type: 'buttons',
    sceneShape: 4,
    nextStep: 'ask_deadline',
  },

  ask_deadline: {
    id: 'ask_deadline',
    messages: [
      {
        variations: [
          'Perfect. That’s enough energy to evolve something extraordinary.',
        ],
      },
      {        
        variations: [
          'When are you hoping this transformation begins?',
        ],
      },
    ],    
    cta: 'timelineButtons',
    type: 'buttons',
    sceneShape: 5,
    nextStep: 'ask_description',
  },

  ask_date: {
    id: 'ask_date',
    messages: [
      {        
        variations: [
          'What’s the big day?',
        ],
      },
    ],    
    cta: 'dateForm',
    type: 'textField',
    sceneShape: 5,
    nextStep: 'ask_description',
  },

  ask_description: {
    id: 'ask_description',
    messages: [
      {        
        variations: [
          'Give me the short version. What are we creating together?',
        ],
      },
    ],
    cta: 'descriptionForm',
    type: 'textField',        
    sceneShape: 6,
    nextStep: 'sey_thanks',
  },

  sey_thanks: {
    id: 'sey_thanks',
    messages: [
      {        
        variations: [
          'Thanks, [Name]. I’ll ripple your details through the Psychoactive pond — the humans will be in touch soon.',
        ],
      },
      {        
        variations: [
          'Consider your metamorphosis officially underway.',
        ],
      },
    ],
    cta: 'finishHomeButton',
    // type: 'textField',
    callback: 'submit',
    sceneShape: 7,
    // nextStep: '',
  },

  // Join the Team Flow
  join_intro: {
    id: 'join_intro',
    messages: [
      {        
        variations: [
          'Ah, a fellow creative creature. Just so you know, all our roles are freelance and project-based.',
        ],
      },
      {        
        variations: [
          'What’s your discipline?',
        ],
      },
    ],
    cta: 'joinTeamButtons',
    type: 'buttons',        
    sceneShape: 4,
    nextStep: 'join_action',
  },
  join_action: {
    id: 'join_action',
    messages: [
      {        
        variations: [
          `Perfect. Send your portfolio and a short intro to [email].\n
          If we vibe, we’ll be in touch faster than a frog catches a fly.
          `,
        ],
      },
      {        
        variations: [
          'Thanks for reaching out — I’ll let the team know another talent is emerging from the pond.',
        ],
      },
    ],
    sceneShape: 7,
    // nextStep: '',
  },
};





