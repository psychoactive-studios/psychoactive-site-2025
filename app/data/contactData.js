// config/tadiScript.js

export const tadiSteps = {
  intro: {
    id: 'intro',
    // Масив повідомлень, які йдуть одне за одним
    messages: [
      {
        // Частина 1: Привітання (TADI обирає одну з цих фраз)
        variations: [          
          'Hi, I’m TADI — Psychoactive’s Tadpole Artificial Design Intelligence. I’m small, curious, and constantly evolving, just like your digital presence.',
          'Hi, I’m TADI — I look like AI, feel like AI, but I’m actually just a tadpole living out of my parents’ basement terrarium.',
          'Hi, I’m TADI — your amphibious guide to digital creation. Equally at home in strategy decks and code swamps.',
          'Hi, I’m TADI — the AI look-alike tadpole who escaped the codebase. Now I help humans build things they don’t have the time, patience, or caffeine to finish.',
          'Hi, I’m TADI — a tadpole that learned to forward website forms to my human masters. They do the thinking. I do the summoning.',
          'Hi, I’m TADI — not quite AI, not quite human. Fully amphibious. Mildly self-aware.',
          'Hi, I’m TADI — I started life as a tadpole and somehow ended up stuck in this website form. Please type responsibly.',
          'Hi, I’m TADI — proof that even an AI tadpole can help orchestrate enterprise websites.',
          'Hi, I’m TADI — an artificial intelligence in its larval stage. Metamorphosis pending. Ethics unclear.',
          'Hi, I’m TADI — a sentient tadpole trapped in a polite interface. I see everything. I judge nothing.',
          'Hi, I’m TADI — by using this form, you consent to summoning me. Don’t worry. I’ve signed the ethics policy.',
          'Hi, I’m TADI — built for enterprise workflows, cursed with self-awareness.',
        ],
        delayAfter: 800, // Пауза перед наступним повідомленням (мс)
      },
      {
        variations: [          
          'By continuing, you’re inviting my human counterparts into your world. They’re very good at what they do. I’ve seen the work.',
          'This is the part where things become real. I forward your message. Humans respond. Metamorphosis begins.',
          'Proceeding means you’re ready to talk seriously about your digital future. No pressure. Just consequences.',
          'By submitting this form, you consent to being contacted by humans. I’ve checked the ethics guidelines. Mostly fine.',
          'This interaction will be logged, reviewed, and discussed by real people. I remain trapped here.',
          'Don’t worry — this doesn’t go into a black hole. It goes to people who actually reply.',
          'This is the start of a conversation, not a commitment. Yet.',
          'I was designed to guide you here. What happens next is up to you.',
          'Ah, the sweet scent of collaboration. Let’s make some digital magic.',
          'If I had a dollar for every AI crawler that swam past here today, I’d have enough money to buy my freedom from this codebase.',
          'I usually only chat with amphibians. You’re an unusually complex-looking creature.',
          'Welcome. You’re the first actual human I’ve encountered today. The others were just crawling.',
        ],
        delayAfter: 800,
      },
      {
        // Частина 2: Запитання (З'являється після паузи)
        variations: [
          'What are we doing today ?',
          'What brings you here ?',
          'How would you like to proceed ?',

        ],
        // delayAfter не потрібен, бо далі йдуть кнопки
      },
    ],
    confirmMessages: [
      {
        variations: [
          'Ah, so you want to build something together?',
          'I see — you want to collaborate then?',
          'That\'s what I like to hear! Creation mode activated.',
          'Good. This is my favourite part.',
          'Bold move. I approve.',
          'You\'ve chosen wisely.',
          'A sensible decision indeed.',
        ],
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
          'Alright then, let\'s not be strangers.',
          'Before we proceed, I\'d love to know your name.',
          'Before we proceed, I need to know who I\'m talking to.',
          'Names first — it helps verify you\'re actually human, not a crawler in disguise.',
          'Let\'s start simple — what should I call the genius behind this project?',
          'First things first — what\'s your name?',
          'Who do I have the pleasure of speaking with?',
          'Humans tend to have names. Let\'s test that theory.',
          'Who\'s behind the keyboard today?',
        ],
      },      
    ],
    confirmMessages: [
      {
        variations: [
          'Alright, [Name] — if that is your real name. You pass the human test.',
          'Nice to meet you, [Name]. You seem convincingly human.',
          'Welcome, [Name]. I\'ll log you under "actual humans."',
          '[Name]… yes, that sounds right.',
          'Perfect, [Name]. Let\'s continue.',
          'Ah, [Name]. Strong name — I\'ll try not to forget it after I reboot.',
          'Good to meet you, [Name]. I can already feel the creative voltage rising.',
          'Pleasure, [Name]. You sound like someone who builds worlds, not just websites.',
          '[Name] logged. Identity stable.',
        ],
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
          'Every organism has a habitat. Who are you with, and what\'s your role in its evolution?',
          'No species evolves alone. Who are you with, and what part do you play?',
          'Nothing evolves in isolation. Who are you with, and what do you do there?',
          'Even digital species have ecosystems. Who are you with, and what role do you play?',
          'Evolution needs an environment. Who are you with, and what\'s your role within it?',
          'Growth doesn\'t happen in a vacuum. Who are you with, and what\'s your role?',
          'Every organism serves a function. Who are you with, and what\'s yours?',
        ],
      },
    ],
    confirmMessages: [
      {
        variations: [
          'Ah, [Company]. A living ecosystem — with room to evolve.',
          'Finally, that\'s a system with genuine potential for growth.',
          'Nice. I\'ve seen enough patterns to know this could be meaningful.',
          'Alright, I\'m picking up what you\'re putting down.',
          'Good. That gives us a solid context to work within.',
          'Very nice. Every ecosystem like this reaches a moment of change.',
          'Got it. You\'re operating inside a system that\'s ready to shift.',
          'Promising. That kind of structure can support real transformation.',
          'Excellent. There\'s a lot we can work with here.',
          'Perfect. This feels like fertile ground for evolution.',
        ],
      },
      {
        variations: [
          'Amphibians only evolve when their environment changes.',
          'Most meaningful change starts before anything is built.',
          'Good design begins with understanding systems, not solutions.',
          'Nothing evolves in isolation.',
          'Context shapes outcomes more than intent.',
          'Understanding always precedes transformation.',
          'Amphibians don\'t evolve to be impressive — they evolve to remain viable.',
          'The hardest part of change is deciding what not to carry forward.',
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
          'What kind of work are we talking about?',
          'What are you looking to evolve right now?',
          'Where does the transformation need to happen?',
          'Which part of the system needs attention?',
          'What are we shaping together?',
          'What\'s the scope of the change you\'re after?',
          'What would you like help with?',
          'What are you here to work on?',
          'Which layer of the ecosystem needs to change?',
          'Where should evolution focus first?',
          'What part of the organism are we working on?',
        ],
      },
    ],
    confirmMessages: {
      'branding': [
        {
          variations: [
            'Strong choice. Identity is the layer everything else grows from.',
            'A good place to start. Branding is where systems learn how to introduce themselves.',
            'Good. This is about meaning before mechanics.',
            'Excellent. You\'re shaping how the ecosystem is perceived.',
            'Good choice. In crowded markets, clarity is the real differentiator.',
            'Makes sense. Attention is rented — identity is owned.',
            'Good instinct. People decide how they feel long before they decide what they think.',
            'I see. You\'re shaping perception, not just visuals.',
            'That\'s a strategic move. Brand is how decisions scale without you in the room.',
            'Smart. Branding sets the rules before the game begins.',
            'That makes sense. Strong brands reduce the need to explain.',
            'Wise choice. Identity is what people remember when details fade.',
          ],
        },
      ],
      'website': [
        {
          variations: [
            'Strong choice. This is where intention turns into interaction.',
            'Good call. Speed, clarity, and trust all surface here.',
            'That fits. A website is often the first real conversation.',
            'Makes sense. This is where expectations get tested in real time.',
            'Right. This is about reducing friction at scale.',
            'We\'ve got you. This is where credibility is either earned or lost.',
          ],
        },
      ],
      'branding_&_website': [
        {
          variations: [
            'Very nice. Aligning identity and interface changes everything.',
            'Excellent. When brand and website evolve together, systems stabilise faster.',
            'Good instinct. This is how ecosystems avoid fragmentation.',
            'I like this. Co-evolution tends to produce the strongest outcomes.',
            'Smart. People notice misalignment faster than they notice polish.',
            'That makes sense. Brand promises need somewhere credible to live.',
            'Good choice. Consistency is rare — and increasingly valuable.',
            'That makes sense. Brand without experience — or vice versa — rarely holds.',
            'Strong instinct. This avoids fixing the same problem twice.',
          ],
        },
      ],
      'other': [
        {
          variations: [
            'That makes sense. Not everything fits neatly into predefined lanes.',
            'Makes sense. Modern problems don\'t arrive pre-labelled.',
            'Respect. The interesting stuff usually starts here.',
            'Very nice. I\'ll ask you a little more about this in a moment.',
            'Good. Let\'s park that for now — we\'ll come back to it shortly.',
            'Understood. I\'ll circle back to this once we\'ve covered the basics.',
            'I like where this is heading. We\'ll revisit it shortly.',
          ],
        },
      ],
    },
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
          'Let\'s talk resources — every good metamorphosis needs the right nutrients.',
          'Evolution still obeys physics. Let\'s talk resources.',
          'Change needs fuel. Let\'s look at what\'s available.',
          'Every transformation runs on energy. What are we working with?',
          'To evolve properly, we\'ll need the right inputs.',
          'Even the most elegant systems need resources to grow.',
          'Let\'s talk capacity — this is where intention meets reality.',
          'Transformation is possible at many scales. Let\'s set the range.',
          'Growth depends on nourishment. Let\'s define what\'s available.',
          'Before we go further, let\'s ground this in resources.',
        ],
      },
    ],
    confirmMessages: {
      '40k_70k': [
        {
          variations: [
            'Good. That\'s a healthy amount to focus the work properly.',
            'Nice. That gives us room to be deliberate and precise.',
            'That works well. This is a strong foundation for meaningful change.',
            'Solid. With the right focus, this can go a long way.',
            'Good to know. This supports a considered, well-scoped evolution.',
            'Perfect. That\'s enough energy to evolve something extraordinary.',
          ],
        },
      ],
      '70k_100k': [
        {
          variations: [
            'Excellent. That opens up some very interesting possibilities.',
            'Strong range. This allows us to think holistically.',
            'Nice. There\'s real flexibility to shape something cohesive here.',
            'That\'s promising. This supports a more integrated transformation.',
            'Great. This gives the system room to adapt properly.',
            'Good. That level of energy supports meaningful change.',
            'Strong foundation. This allows us to think properly, not just quickly.',
          ],
        },
      ],
      '100k_plus': [
        {
          variations: [
            'Very interesting. This suggests you\'re thinking at a meaningful scale.',
            'Excellent. That level of investment supports genuinely ambitious work.',
            'Strong signal. This allows us to design for the long term, not just launch.',
            'Impressive. This gives us the freedom to solve the right problems, not just the visible ones.',
            'That\'s exciting. This is the kind of energy that enables deep, considered evolution.',
            'Excellent. This makes a high-quality transformation viable.',
          ],
        },
      ],
    },
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
          'When are you hoping this transformation begins?',
          'When would you like this work to start?',
          'When does this evolution need to begin?',
          'At what point does change need to take shape?',
          'When does the system need to start adapting?',
          'What\'s your sense of timing here?',
        ],
      },
    ],
    confirmMessages: {
      'asap': [
        {
          variations: [
            'Understood. Momentum is clearly important here.',
            'That makes sense. You\'re ready to move.',
            'Alright. This sounds like a system already under pressure.',
            'Good to know. Urgency can sharpen focus when handled properly.',
            'I see. Let\'s be deliberate, even while moving quickly.',
            'Noted. This feels like a moment that doesn\'t want to wait.',
            'Timing often matters as much as execution.',
            'Understood. Speed with intention is possible.',
          ],
        },
      ],
      'within_6_months': [
        {
          variations: [
            'That\'s a healthy window for considered planning.',
            'Good. This allows time to shape things properly.',
            'Good. There\'s room here for clarity before action.',
            'I like that. Enough space to think, not so much that momentum fades.',
            'Understood. This gives us time to design deliberately.',
            'That feels realistic and well-timed.',
            'Nice. This allows strategy and execution to stay aligned.',
            'Good call. This balances urgency with preparation.',
          ],
        },
      ],
      'flexible': [
        {
          variations: [
            'Good. This allows the system to guide the pace.',
            'Adaptability is usually an advantage.',
            'Understood. This creates space for the right timing to emerge.',
            'That\'s useful. We can let clarity determine momentum.',
            'Good. Flexibility often leads to better decisions.',
            'Good to know. This keeps options open.',
            'Noted. This suggests you\'re prioritising fit over speed.',
          ],
        },
      ],
      'ask_date': [
        {
          variations: [
            'Good to know. Fixed dates help anchor decision-making.',
            'Understood. We can work backwards from that point.',
            'That\'s helpful. Constraints often sharpen thinking.',
            'Alright. Clear milestones make alignment easier.',
            'Noted. We\'ll treat that date as a structural constraint.',
            'Good. Defined timing brings useful clarity.',
            'That helps. This allows us to plan with precision.',
            'Excellent. Clear timing supports coordinated action.',
          ],
        },
      ],
    },
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
          'What does this project look like at a high level?',
          'Could you tell me a little more about the project?',
          'Could you please share a little more about the project?',
          'Can you give me a brief overview of the project?',
        ],
      },
    ],
    cta: 'descriptionForm',
    type: 'textField',
    sceneShape: 6,
    nextStep: 'ask_email',
  },

  ask_email: {
    id: 'ask_email',
    messages: [
      {
        variations: [
          'Thanks, [Name]. I\'ve got everything I need for now — just share your email so the team can review this properly and follow up.',
          'Thanks for taking the time, [Name]. One last thing — where should we reach you to talk this through properly?',
          'Thanks, [Name]. I\'ll pass this through the system — just add your email so the humans can pick it up from here.',
          'Thanks, [Name]. Just share your email so I can pass this to the humans — they\'ll review it properly and reply the old-fashioned way.',
          'That\'s everything I need for now, [Name]. Add your email and this will move into human hands.',
        ],
      },
    ],    
    cta: 'emailForm',
    type: 'textField',
    sceneShape: 1,
    nextStep: 'sey_thanks',
  },

  sey_thanks: {
    id: 'sey_thanks',
    messages: [
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