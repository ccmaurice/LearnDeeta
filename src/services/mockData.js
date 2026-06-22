/**
 * Mock data for LearnDeeta.
 * Allows judges to experience the full multi-agent output without entering an API Key.
 */

export const MOCK_RESPONSES = {
  // 1. Photosynthesis
  'photosynthesis': {
    text: `Hello! Let's learn about **Photosynthesis**, which is how **plants** make their own food using sunlight.

1. **Sunlight Capture**: Leaves have a special green substance called **chlorophyll**. It acts like a solar panel to capture light energy from the **Sun**.

2. **Water and Air Ingest**: The plant drinks **water** from the soil through its roots. It also breathes in a gas called **carbon dioxide** from the air through tiny holes in its leaves.

3. **Cooking Food**: Using the sun's energy, the plant mixes the water and carbon dioxide together. This chemical cooking produces a simple sugar called **glucose**, which is the plant's food.

4. **Oxygen Release**: During this cooking process, the plant makes **oxygen** as a waste product and releases it back into the air. This is the air we breathe!

In summary, **photosynthesis** uses **sunlight**, **water**, and **air** to create **sugar** for the plant and **oxygen** for us.`,
    
    diagram: `flowchart TD
  Sun[Sunlight] -->|Captured by Chlorophyll| Leaf[Leaf Studio]
  Water[Water from Roots] --> Leaf
  CO2[Carbon Dioxide from Air] --> Leaf
  Leaf -->|Chemical Reaction| Sugar[Glucose: Plant Food]
  Leaf -->|Released to Air| Oxy[Oxygen: Clean Air]`,

    glossary: [
      { word: "Photosynthesis", simplified: "How plants make food from light", synonyms: ["plant food making", "light absorption"] },
      { word: "Chlorophyll", simplified: "The green stuff in leaves", synonyms: ["leaf coloring", "sun collector"] },
      { word: "Glucose", simplified: "A simple sugar plants eat", synonyms: ["plant sugar", "energy sugar"] },
      { word: "Carbon Dioxide", simplified: "A gas we breathe out", synonyms: ["CO2", "old air"] }
    ],

    activities: {
      flashcards: [
        { title: "Solar Collectors", description: "Chlorophyll in leaves absorbs solar energy from sunlight to cook plant food.", category: "nature" },
        { title: "Roots Drink Water", description: "Plant roots drink water from soil, carrying it up to leaves like a straw.", category: "nature" },
        { title: "Oxygen Factory", description: "Plants release fresh oxygen back into the air, keeping us alive.", category: "nature" }
      ],
      checklist: [
        "Recall what pigment makes leaves green.",
        "Name the two ingredients plants mix to make sugar.",
        "State what gas plants release into the air."
      ],
      quiz: [
        {
          question: "What is the green substance in leaves called?",
          options: ["Chlorophyll", "Oxygen", "Glucose"],
          correctIndex: 0,
          explanation: "Chlorophyll is the green pigment that absorbs light energy."
        },
        {
          question: "What is the sugar food made by the plant?",
          options: ["Carbon dioxide", "Glucose", "Water"],
          correctIndex: 1,
          explanation: "Glucose is the simple sugar that provides energy to the plant."
        },
        {
          question: "What helpful gas do plants release into the air?",
          options: ["Oxygen", "Carbon dioxide", "Nitrogen"],
          correctIndex: 0,
          explanation: "Plants produce and release oxygen as a byproduct of photosynthesis."
        }
      ],
      videoSearchQuery: "photosynthesis simple animation for kids"
    }
  },

  // 2. Why the sky is blue
  'sky_blue': {
    text: `Let's find out why the **sky is blue**. It is all about how **sunlight** interacts with the **air**!

1. **White Light**: Sunlight looks white, but it is actually made of all the colors of the **rainbow** mixed together. Each color travels in different waves.

2. **Wave Sizes**: Red and yellow colors travel in long, lazy waves. **Blue** and violet colors travel in short, fast, and choppy waves.

3. **Scattering Air**: Earth is surrounded by air full of gases. When the short, choppy **blue light** waves hit the gas particles in the air, they bounce around in every direction. We call this **scattering**.

4. **Eyes See Blue**: Because blue light bounces and scatters all over the sky, whenever we look up, we see this scattered blue light.

In summary, the sky is blue because **blue light** waves are short and bounce off the gas in the **atmosphere** more than other colors.`,
    
    diagram: `flowchart TD
  Sun[Sunlight: White Light] --> Atm[Earth's Atmosphere]
  Atm -->|Long waves pass through| Ground[Red/Yellow hits ground]
  Atm -->|Short waves scatter| Sky[Blue waves bounce around]
  Sky --> Eye[We look up and see Blue]`,

    glossary: [
      { word: "Atmosphere", simplified: "The air surrounding the Earth", synonyms: ["sky air", "gas blanket"] },
      { word: "Scattering", simplified: "Bouncing light in all directions", synonyms: ["diffusing", "spreading"] },
      { word: "Particles", simplified: "Tiny bits of dust or gas", synonyms: ["specs", "tiny bits"] }
    ],

    activities: {
      flashcards: [
        { title: "Rainbow Light", description: "White sunlight is actually made of all colors of the rainbow combined.", category: "space" },
        { title: "Choppy Blue Waves", description: "Blue light waves are tiny and choppy, making them bounce easily.", category: "space" },
        { title: "Light Scattering", description: "Air molecules scatter blue light all over, painting the sky blue.", category: "space" }
      ],
      checklist: [
        "Explain what sunlight is actually made of.",
        "Describe the size of blue light waves.",
        "Name the process where light bounces in all directions."
      ],
      quiz: [
        {
          question: "What color waves are the shortest and choppiest?",
          options: ["Red", "Green", "Blue"],
          correctIndex: 2,
          explanation: "Blue light waves are short and choppy compared to long red waves."
        },
        {
          question: "What happens when blue light hits gas particles?",
          options: ["It disappears", "It scatters and bounces", "It turns red"],
          correctIndex: 1,
          explanation: "The gas causes the short blue light waves to scatter in all directions."
        },
        {
          question: "What is the layer of air around Earth called?",
          options: ["Atmosphere", "Oxygen", "Ocean"],
          correctIndex: 0,
          explanation: "The atmosphere is the envelope of gases surrounding our planet."
        }
      ],
      videoSearchQuery: "why is the sky blue science animation"
    }
  },

  // 3. Gravity
  'gravity': {
    text: `Let's explore **Gravity**! It is the invisible force that pulls things together.

1. **Pulling Force**: Gravity acts like an **invisible magnet**. Every object in the universe has gravity, and it pulls other objects towards its center.

2. **Mass Matters**: The **larger** and heavier an object is, the stronger its gravity pull. Because the **Earth** is massive, it has a very strong pull.

3. **Keeps Us Down**: Earth's gravity pull is what keeps your feet on the ground and stops you from floating away into **outer space**. It's also why things fall down when dropped.

4. **Orbits in Space**: Gravity is what holds the **Moon** in orbit around the Earth, and keeps the Earth orbiting around the **Sun**.

In summary, **gravity** is an invisible pulling force that keeps us grounded and holds planets in their orbits.`,
    
    diagram: `flowchart TD
  MassiveEarth[Massive Earth] -->|Strong Pull| Feet[Keeps feet on ground]
  MassiveEarth -->|Pulls object down| Drop[Dropped apple falls]
  Sun[Massive Sun] -->|Holds in Orbit| Earth[Earth orbits Sun]
  Earth -->|Holds in Orbit| Moon[Moon orbits Earth]`,

    glossary: [
      { word: "Gravity", simplified: "Invisible pull between objects", synonyms: ["pulling force", "grounding force"] },
      { word: "Orbit", simplified: "Circular path in space", synonyms: ["track", "spin path"] },
      { word: "Massive", simplified: "Extremely large and heavy", synonyms: ["huge", "giant"] }
    ],

    activities: {
      flashcards: [
        { title: "Invisible Magnet", description: "Gravity pulls everything toward the center of massive objects.", category: "space" },
        { title: "Earth Holds Us", description: "Without Earth's gravity pull, we would float away into space.", category: "space" },
        { title: "Solar Dance", description: "Sun's giant gravity pulls Earth, keeping it on a circular orbit path.", category: "space" }
      ],
      checklist: [
        "Explain what determines how strong gravity is.",
        "Name what would happen to us without gravity.",
        "Describe what paths planets follow because of gravity."
      ],
      quiz: [
        {
          question: "What determines the strength of gravity?",
          options: ["The object's size and weight (mass)", "The object's color", "The object's temperature"],
          correctIndex: 0,
          explanation: "Heavier, more massive objects have a stronger gravitational pull."
        },
        {
          question: "What does gravity do when you drop an object?",
          options: ["Pushes it up", "Pulls it down", "Makes it float"],
          correctIndex: 1,
          explanation: "Gravity pulls everything toward the center of the Earth (down)."
        },
        {
          question: "What keeps the Moon circling the Earth?",
          options: ["Wind", "Gravity", "Rocket power"],
          correctIndex: 1,
          explanation: "Earth's gravity holds the Moon in its circular orbit."
        }
      ],
      videoSearchQuery: "gravity explained simply for kids"
    }
  },

  // 4. Butterfly life cycle
  'butterfly': {
    text: `Let's look at the amazing life cycle of a **butterfly**! It goes through four main stages, a process called **metamorphosis**.

1. **The Egg**: A mother butterfly lays a tiny **egg** on a leaf. Inside this egg, a baby caterpillar is growing.

2. **The Caterpillar**: The egg hatches, and out crawls a hungry **caterpillar**. Its main job is to **eat leaves** and grow very big, shedding its skin as it expands.

3. **The Pupa (Chrysalis)**: Once fully grown, the caterpillar hangs upside down and forms a hard shell called a **chrysalis** or pupa. Inside, its body is completely changing.

4. **The Butterfly**: Finally, the chrysalis opens, and a beautiful **butterfly** crawls out. It dries its wings and flies off to find flowers.

In summary, a butterfly grows from an **egg** to a **caterpillar**, rests inside a **chrysalis**, and emerges as a flying **butterfly**.`,
    
    diagram: `flowchart TD
  Egg[Stage 1: Tiny Egg on Leaf] -->|Hatches| Cat[Stage 2: Hungry Caterpillar]
  Cat -->|Grows and Shells| Chry[Stage 3: Hard Chrysalis Shell]
  Chry -->|Metamorphosis| Butter[Stage 4: Flying Butterfly]
  Butter -->|Lays egg| Egg`,

    glossary: [
      { word: "Metamorphosis", simplified: "Changing body shape completely", synonyms: ["body change", "transformation"] },
      { word: "Chrysalis", simplified: "Hard protective insect shell", synonyms: ["pupa", "cocoon"] },
      { word: "Hatch", simplified: "Break out of an egg", synonyms: ["break open", "emerge"] }
    ],

    activities: {
      flashcards: [
        { title: "Hungry Caterpillar", description: "Caterpillars munch on green leaves to store energy for their big change.", category: "nature" },
        { title: "Inside the Chrysalis", description: "Inside the hard shell, the caterpillar's body breaks down and rebuilds.", category: "nature" },
        { title: "Emerging Wings", description: "A damp butterfly emerges, pumping blood to expand its wings for flight.", category: "nature" }
      ],
      checklist: [
        "Recall what stage comes immediately after the egg.",
        "Name the shell the caterpillar builds around itself.",
        "Explain what process transforms the insect's body."
      ],
      quiz: [
        {
          question: "What is the second stage of a butterfly's life?",
          options: ["Egg", "Caterpillar", "Chrysalis"],
          correctIndex: 1,
          explanation: "The egg hatches into a caterpillar, which is the second stage."
        },
        {
          question: "What is the protective shell called?",
          options: ["Cocoon", "Chrysalis", "Eggshell"],
          correctIndex: 1,
          explanation: "A butterfly pupa rests inside a chrysalis."
        },
        {
          question: "What is the big body transformation called?",
          options: ["Metamorphosis", "Photosynthesis", "Gravity"],
          correctIndex: 0,
          explanation: "Metamorphosis is the scientific term for this dramatic transformation."
        }
      ],
      videoSearchQuery: "butterfly life cycle time lapse animation"
    }
  }
};
