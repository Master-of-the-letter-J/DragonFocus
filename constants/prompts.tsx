import { QuestionSettings } from '../context/QuestionProvider';
export interface WrittenPrompt {
	text: string;
	category: keyof QuestionSettings['prompts']['types'] | 'SelfDiscovery' | 'Reflection' | 'Gratitude' | 'Creative' | 'Mindfulness' | 'Productivity' | 'Relationships';
}

export interface TriviaQuestion {
	text: string;
	answers: string[];
	correctIndex: number;
	category: keyof QuestionSettings['trivia']['types'] | 'General' | 'PopCulture' | 'History' | 'Science' | 'Geography' | 'Sports' | 'LiteratureArts' | 'Food';
}

// ---------------------------------------------------------------------------
// PROMPTS
// Categories: Self-Discovery, Reflection, Gratitude, Fun & Creative,
// Mindfulness, Productivity, Relationships
// ---------------------------------------------------------------------------

export const PROMPTS: WrittenPrompt[] = [
	// -------------------------------------------------------------------------
	// Category: Self-Discovery
	// -------------------------------------------------------------------------
	{ text: "Write a Fear: Why It's Irrational", category: 'SelfDiscovery' },
	{ text: 'Write 1 Word to Describe Yourself', category: 'SelfDiscovery' },
	{ text: 'What is your earliest memory?', category: 'SelfDiscovery' },
	{ text: 'What brings out your best self?', category: 'SelfDiscovery' },
	{ text: 'Write about your greatest strength', category: 'SelfDiscovery' },
	{ text: 'What is a core value you will never compromise?', category: 'SelfDiscovery' },
	{ text: 'Describe a time you felt truly authentic', category: 'SelfDiscovery' },
	{ text: "What does 'success' mean to you personally?", category: 'SelfDiscovery' },
	{ text: 'If money were no object, how would you spend your days?', category: 'SelfDiscovery' },
	{ text: 'What is a limiting belief you hold about yourself?', category: 'SelfDiscovery' },
	{ text: "Write about a passion you haven't explored yet", category: 'SelfDiscovery' },
	{ text: 'What part of your personality are you most proud of?', category: 'SelfDiscovery' },
	{ text: 'When do you feel most like yourself?', category: 'SelfDiscovery' },
	{ text: 'What is a lesson you learned the hard way?', category: 'SelfDiscovery' },
	{ text: 'Write a letter to your teenage self', category: 'SelfDiscovery' },
	{ text: 'What is something you wish more people understood about you?', category: 'SelfDiscovery' },
	{ text: 'Describe a moment you surprised yourself', category: 'SelfDiscovery' },
	{ text: 'What emotion do you avoid the most, and why?', category: 'SelfDiscovery' },
	{ text: 'What is a belief you outgrew?', category: 'SelfDiscovery' },
	{ text: 'What is a dream you’ve never said out loud?', category: 'SelfDiscovery' },
	{ text: 'What makes you feel grounded?', category: 'SelfDiscovery' },
	{ text: 'What is a habit you want to build this year?', category: 'SelfDiscovery' },
	{ text: 'What is a habit you want to break?', category: 'SelfDiscovery' },
	{ text: 'What is your personal definition of peace?', category: 'SelfDiscovery' },
	{ text: 'What is something you’ve forgiven yourself for?', category: 'SelfDiscovery' },
	{ text: 'What is something you still need to forgive yourself for?', category: 'SelfDiscovery' },
	{ text: 'What is a compliment you struggle to accept?', category: 'SelfDiscovery' },
	{ text: 'What is a compliment you wish someone would give you?', category: 'SelfDiscovery' },
	{ text: 'What is a moment you felt truly proud?', category: 'SelfDiscovery' },
	{ text: 'What is a moment you felt deeply understood?', category: 'SelfDiscovery' },
	{ text: 'What is a moment you felt misunderstood?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to learn about yourself?', category: 'SelfDiscovery' },
	{ text: 'What is a boundary you need to set?', category: 'SelfDiscovery' },
	{ text: 'What is a boundary you recently strengthened?', category: 'SelfDiscovery' },
	{ text: 'What is a boundary you regret not setting sooner?', category: 'SelfDiscovery' },
	{ text: 'What is a value you want to embody more fully?', category: 'SelfDiscovery' },
	{ text: 'What is a fear that motivates you?', category: 'SelfDiscovery' },
	{ text: 'What is a fear that holds you back?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to be remembered for?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to stop apologizing for?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to start taking credit for?', category: 'SelfDiscovery' },
	{ text: 'What is a belief about yourself that has changed over time?', category: 'SelfDiscovery' },
	{ text: 'What is a belief about the world that has changed over time?', category: 'SelfDiscovery' },
	{ text: 'What is a truth you discovered recently?', category: 'SelfDiscovery' },
	{ text: 'What is a truth you’re still resisting?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to explore creatively?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to explore intellectually?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to explore emotionally?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to explore spiritually?', category: 'SelfDiscovery' },
	{ text: 'What is a memory you revisit often?', category: 'SelfDiscovery' },
	{ text: 'What is a memory you avoid revisiting?', category: 'SelfDiscovery' },
	{ text: 'What is a moment that shaped your identity?', category: 'SelfDiscovery' },
	{ text: 'What is a moment that changed your perspective?', category: 'SelfDiscovery' },
	{ text: 'What is a moment that made you stronger?', category: 'SelfDiscovery' },
	{ text: 'What is a moment that humbled you?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to unlearn?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to relearn?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to master?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to let go of?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to hold onto?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to protect?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to risk?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to create?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to destroy (symbolically)?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to rebuild?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to improve?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to simplify?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to complicate (in a good way)?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to understand better?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to experience again?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to experience for the first time?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to stop doing?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to start doing?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to continue doing?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to do differently?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to do more often?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to do less often?', category: 'SelfDiscovery' },
	{ text: 'What is a truth you’re afraid to admit?', category: 'SelfDiscovery' },
	{ text: 'What is a truth you’re proud to admit?', category: 'SelfDiscovery' },
	{ text: 'What is a question you wish someone would ask you?', category: 'SelfDiscovery' },
	{ text: 'What is a question you avoid asking yourself?', category: 'SelfDiscovery' },
	{ text: 'What is a question you want to explore today?', category: 'SelfDiscovery' },
	{ text: 'What is a part of yourself you’re learning to love?', category: 'SelfDiscovery' },
	{ text: 'What is a part of yourself you’re learning to accept?', category: 'SelfDiscovery' },
	{ text: 'What is a part of yourself you’re learning to challenge?', category: 'SelfDiscovery' },
	{ text: 'What is a part of yourself you’re learning to express?', category: 'SelfDiscovery' },
	{ text: 'What is a part of yourself you’re learning to trust?', category: 'SelfDiscovery' },
	{ text: 'What is a part of yourself you’re learning to heal?', category: 'SelfDiscovery' },
	{ text: 'What is a part of yourself you’re learning to reveal?', category: 'SelfDiscovery' },
	{ text: 'What is a part of yourself you’re learning to protect?', category: 'SelfDiscovery' },
	{ text: 'What is something you want to prove to yourself?', category: 'SelfDiscovery' },
	{ text: 'What is something you no longer need to prove?', category: 'SelfDiscovery' },
	{ text: 'Explore a desire you rarely admit', category: 'SelfDiscovery' },
	{ text: 'What fear still shapes your choices?', category: 'SelfDiscovery' },
	{ text: 'Name a strength you overlook', category: 'SelfDiscovery' },
	{ text: 'Describe a weakness you’re ready to outgrow', category: 'SelfDiscovery' },
	{ text: 'What habit reveals the real you?', category: 'SelfDiscovery' },
	{ text: 'What motivates you more than you admit?', category: 'SelfDiscovery' },
	{ text: 'Write about a dream you refuse to abandon', category: 'SelfDiscovery' },
	{ text: 'What intuition do you ignore most often?', category: 'SelfDiscovery' },
	{ text: 'Where does your resilience come from?', category: 'SelfDiscovery' },
	{ text: 'What identity are you slowly growing into?', category: 'SelfDiscovery' },
	{ text: 'What version of you feels most alive?', category: 'SelfDiscovery' },
	{ text: 'What emotion teaches you the most?', category: 'SelfDiscovery' },
	{ text: 'What desire scares you because it matters?', category: 'SelfDiscovery' },
	{ text: 'What truth are you finally ready to face?', category: 'SelfDiscovery' },
	{ text: 'What part of your past still guides you?', category: 'SelfDiscovery' },
	{ text: 'What future version of you inspires you?', category: 'SelfDiscovery' },
	{ text: 'What belief about yourself is evolving?', category: 'SelfDiscovery' },
	{ text: 'What potential are you afraid to tap into?', category: 'SelfDiscovery' },
	{ text: 'What inner voice deserves more attention?', category: 'SelfDiscovery' },
	{ text: 'What personal shift are you currently undergoing?', category: 'SelfDiscovery' },

	// -------------------------------------------------------------------------
	// Category: Reflection
	// -------------------------------------------------------------------------
	{ text: 'Write a Short Reflection', category: 'Reflection' },
	{ text: 'What made you smile today?', category: 'Reflection' },
	{ text: 'Write about a time you handled stress well', category: 'Reflection' },
	{ text: 'What is one learning from today?', category: 'Reflection' },
	{ text: 'Write about a mistake you made and what it taught you', category: 'Reflection' },
	{ text: 'How have you changed in the last year?', category: 'Reflection' },
	{ text: 'What is something you wish you had done differently recently?', category: 'Reflection' },
	{ text: 'Reflect on a difficult conversation you had', category: 'Reflection' },
	{ text: 'What energy did you bring to your interactions today?', category: 'Reflection' },
	{ text: 'Write about a moment of clarity you had', category: 'Reflection' },
	{ text: 'What is a habit you are trying to break?', category: 'Reflection' },
	{ text: 'Reflect on how you spent your time this weekend', category: 'Reflection' },
	{ text: 'What is something you are avoiding right now?', category: 'Reflection' },
	{ text: 'Write about a risk you took', category: 'Reflection' },
	{ text: 'How do you recharge after a long day?', category: 'Reflection' },

	// -------------------------------------------------------------------------
	// Category: Gratitude
	// -------------------------------------------------------------------------
	{ text: "Write 1 Thing You're Grateful for", category: 'Gratitude' },
	{ text: "Write 3 Things You're Grateful for", category: 'Gratitude' },
	{ text: "Name three people you're grateful for and why", category: 'Gratitude' },
	{ text: 'What is a simple pleasure you enjoyed today?', category: 'Gratitude' },
	{ text: 'Write about a mentor or teacher who helped you', category: 'Gratitude' },
	{ text: 'What is something about your home you appreciate?', category: 'Gratitude' },
	{ text: 'Describe a meal you are thankful for', category: 'Gratitude' },
	{ text: 'What is a technology you are grateful exists?', category: 'Gratitude' },
	{ text: 'Write about a friend who is always there for you', category: 'Gratitude' },
	{ text: 'What is a challenge that turned into a blessing?', category: 'Gratitude' },
	{ text: 'Be grateful for a specific sense (sight, hearing, etc.)', category: 'Gratitude' },
	{ text: 'What is a book or movie you are glad you experienced?', category: 'Gratitude' },
	{ text: 'Write about a kindness a stranger showed you', category: 'Gratitude' },
	{ text: 'What aspect of nature are you thankful for today?', category: 'Gratitude' },
	{ text: 'Write a thank you note to your body', category: 'Gratitude' },

	// -------------------------------------------------------------------------
	// Category: Fun & Creative
	// -------------------------------------------------------------------------
	{ text: 'Describe your perfect 30-minute break', category: 'Creative' },
	{ text: 'Write 3 Ideas', category: 'Creative' },
	{ text: 'Write 5 Ideas', category: 'Creative' },
	{ text: 'If you could have any superpower, what would it be?', category: 'Creative' },
	{ text: 'Describe your dream vacation spot in detail', category: 'Creative' },
	{ text: 'Invent a new holiday. How is it celebrated?', category: 'Creative' },
	{ text: 'Write the first sentence of a mystery novel', category: 'Creative' },
	{ text: 'If animals could talk, which one would be the rudest?', category: 'Creative' },
	{ text: 'Design your perfect treehouse', category: 'Creative' },
	{ text: 'If you could have dinner with any fictional character, who?', category: 'Creative' },
	{ text: 'Write a haiku about your breakfast', category: 'Creative' },
	{ text: 'What would the title of your biography be?', category: 'Creative' },
	{ text: 'Describe the world 100 years from now', category: 'Creative' },
	{ text: 'Create a new name for a color and describe it', category: 'Creative' },
	{ text: 'If you opened a shop, what would you sell?', category: 'Creative' },

	// -------------------------------------------------------------------------
	// Category: Mindfulness
	// -------------------------------------------------------------------------
	{ text: '1 Word of How You Feel', category: 'Mindfulness' },
	{ text: 'What are three sounds you like right now?', category: 'Mindfulness' },
	{ text: 'Describe your surroundings using only touch textures', category: 'Mindfulness' },
	{ text: 'Take a deep breath and describe how it felt', category: 'Mindfulness' },
	{ text: 'What is the dominant color in your room right now?', category: 'Mindfulness' },
	{ text: 'Scan your body. Where are you holding tension?', category: 'Mindfulness' },
	{ text: 'Describe the taste of your last meal slowly', category: 'Mindfulness' },
	{ text: 'What is the temperature like right now?', category: 'Mindfulness' },
	{ text: 'Observe an object near you for one minute. Describe it.', category: 'Mindfulness' },
	{ text: 'Write down every thought you have for 60 seconds', category: 'Mindfulness' },
	{ text: 'Focus on the silence between sounds', category: 'Mindfulness' },
	{ text: 'How does your feet touching the floor feel?', category: 'Mindfulness' },
	{ text: 'Describe the light in the room', category: 'Mindfulness' },
	{ text: 'What scent can you smell right now?', category: 'Mindfulness' },
	{ text: 'Sit still for a moment. What is the first thing you notice?', category: 'Mindfulness' },

	// -------------------------------------------------------------------------
	// Category: Productivity
	// -------------------------------------------------------------------------
	{ text: 'What small habit would improve your day?', category: 'Productivity' },
	{ text: 'Name one thing you can delegate this week', category: 'Productivity' },
	{ text: 'Write one quick goal for tomorrow', category: 'Productivity' },
	{ text: 'Write a short plan to avoid a common distraction', category: 'Productivity' },
	{ text: 'What is the most important task for today?', category: 'Productivity' },
	{ text: "Identify a 'time waster' in your routine", category: 'Productivity' },
	{ text: 'How can you make your workspace more efficient?', category: 'Productivity' },
	{ text: 'What is a project you need to break down into smaller steps?', category: 'Productivity' },
	{ text: 'List 3 priorities for the upcoming week', category: 'Productivity' },
	{ text: 'What is one thing you can remove from your to-do list?', category: 'Productivity' },
	{ text: 'Describe your ideal morning routine for efficiency', category: 'Productivity' },
	{ text: 'What tool or app helps you stay organized?', category: 'Productivity' },
	{ text: 'When are you most productive during the day?', category: 'Productivity' },
	{ text: 'Set a timer for 5 minutes. What can you clean?', category: 'Productivity' },
	{ text: 'What is a skill you want to learn to help your career?', category: 'Productivity' },

	// -------------------------------------------------------------------------
	// Category: Relationships
	// -------------------------------------------------------------------------
	{ text: 'Describe a meaningful relationship', category: 'Relationships' },
	{ text: "What's a compliment you received recently?", category: 'Relationships' },
	{ text: 'Write about a person who inspires you', category: 'Relationships' },
	{ text: 'How can you be a better listener today?', category: 'Relationships' },
	{ text: "Who haven't you spoken to in a while that you miss?", category: 'Relationships' },
	{ text: 'Describe a quality you admire in your best friend', category: 'Relationships' },
	{ text: 'What is a boundary you need to set?', category: 'Relationships' },
	{ text: 'Write about a shared memory that makes you laugh', category: 'Relationships' },
	{ text: 'How do you show love to others?', category: 'Relationships' },
	{ text: 'Who is the funniest person you know?', category: 'Relationships' },
	{ text: "What does 'support' look like to you?", category: 'Relationships' },
	{ text: 'Write about a time you forgave someone', category: 'Relationships' },
	{ text: 'Who do you turn to when you need advice?', category: 'Relationships' },
	{ text: 'What is a family tradition you cherish?', category: 'Relationships' },
	{ text: 'How would you describe your communication style?', category: 'Relationships' },
];

// ---------------------------------------------------------------------------
// TRIVIA
// Categories: General Knowledge, Pop Culture, History, Science, Geography,
// Sports, Literature / Arts, Food
// ---------------------------------------------------------------------------

export const TRIVIA: TriviaQuestion[] = [
	// -------------------------------------------------------------------------
	// Category: General Knowledge
	// -------------------------------------------------------------------------
	{ text: 'How many minutes are in an hour?', answers: ['60', '50', '45', '30'], correctIndex: 0, category: 'General' },
	{ text: 'How many seconds are in 5 minutes?', answers: ['300', '250', '200', '150'], correctIndex: 0, category: 'General' },
	{ text: 'How many days are in a year?', answers: ['365', '360', '366', '350'], correctIndex: 0, category: 'General' },
	{ text: 'What currency is used in Japan?', answers: ['Yen', 'Won', 'Dollar', 'Yuan'], correctIndex: 0, category: 'General' },
	{ text: 'How many mm are in a cm?', answers: ['10', '100', '5', '20'], correctIndex: 0, category: 'General' },
	{ text: 'How many inches are in a foot?', answers: ['12', '10', '8', '14'], correctIndex: 0, category: 'General' },
	{ text: 'What is the term for a group of crows?', answers: ['Murder', 'Pack', 'Flock', 'School'], correctIndex: 0, category: 'General' },
	{ text: 'Which card suit is red?', answers: ['Diamond', 'Spade', 'Club', 'None'], correctIndex: 0, category: 'General' },
	{ text: 'How many weeks are in a year?', answers: ['52', '48', '50', '54'], correctIndex: 0, category: 'General' },
	{ text: 'What is the freezing point of water in Celsius?', answers: ['0', '32', '100', '-10'], correctIndex: 0, category: 'General' },
	{ text: 'Which month has 28 days?', answers: ['All of them', 'February', 'January', 'March'], correctIndex: 0, category: 'General' },
	{ text: 'How many zeros are in a million?', answers: ['6', '5', '7', '8'], correctIndex: 0, category: 'General' },

	// -------------------------------------------------------------------------
	// Category: Pop Culture
	// -------------------------------------------------------------------------
	{ text: 'Which Disney movie features Elsa?', answers: ['Frozen', 'Moana', 'Tangled', 'Brave'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Who lives in a pineapple under the sea?', answers: ['SpongeBob SquarePants', 'Patrick Star', 'Squidward', 'Mr. Krabs'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Which house does Harry Potter belong to?', answers: ['Gryffindor', 'Slytherin', 'Hufflepuff', 'Ravenclaw'], correctIndex: 0, category: 'PopCulture' },
	{ text: "What is the name of Han Solo's ship?", answers: ['Millennium Falcon', 'X-Wing', 'TIE Fighter', 'Death Star'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Who is the alter ego of Spider-Man?', answers: ['Peter Parker', 'Bruce Wayne', 'Clark Kent', 'Tony Stark'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Which TV show is set in Westeros?', answers: ['Game of Thrones', 'The Witcher', 'Breaking Bad', 'Friends'], correctIndex: 0, category: 'PopCulture' },
	{ text: "Who sung 'Thriller'?", answers: ['Michael Jackson', 'Prince', 'Madonna', 'David Bowie'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'What is the name of the toy cowboy in Toy Story?', answers: ['Woody', 'Buzz', 'Andy', 'Rex'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Which superhero is known as the Dark Knight?', answers: ['Batman', 'Superman', 'Flash', 'Green Lantern'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'In The Office, who is the Regional Manager?', answers: ['Michael Scott', 'Jim Halpert', 'Dwight Schrute', 'Pam Beesly'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Who is the lead singer of Queen?', answers: ['Freddie Mercury', 'Elton John', 'Mick Jagger', 'Bono'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'What is the highest-grossing movie of all time (as of 2024)?', answers: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars'], correctIndex: 0, category: 'PopCulture' },

	// -------------------------------------------------------------------------
	// Category: History
	// -------------------------------------------------------------------------
	{ text: 'What year did the Titanic sink?', answers: ['1912', '1905', '1915', '1920'], correctIndex: 0, category: 'History' },
	{ text: 'Who was the first President of the United States?', answers: ['George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'John Adams'], correctIndex: 0, category: 'History' },
	{ text: 'Which ancient civilization built the pyramids?', answers: ['Egyptians', 'Romans', 'Greeks', 'Mayans'], correctIndex: 0, category: 'History' },
	{ text: 'In which year did World War II end?', answers: ['1945', '1939', '1918', '1950'], correctIndex: 0, category: 'History' },
	{ text: 'Who discovered America in 1492?', answers: ['Christopher Columbus', 'Leif Erikson', 'Amerigo Vespucci', 'Ferdinand Magellan'], correctIndex: 0, category: 'History' },
	{ text: 'Which empire was ruled by Julius Caesar?', answers: ['Roman', 'Ottoman', 'British', 'Mongol'], correctIndex: 0, category: 'History' },
	{ text: "Who delivered the 'I Have a Dream' speech?", answers: ['Martin Luther King Jr.', 'Malcolm X', 'Rosa Parks', 'John F. Kennedy'], correctIndex: 0, category: 'History' },
	{ text: 'What was the name of the ship that brought the Pilgrims to America?', answers: ['Mayflower', 'Santa Maria', 'Pinta', 'Nina'], correctIndex: 0, category: 'History' },
	{ text: 'Who was the first woman to fly solo across the Atlantic?', answers: ['Amelia Earhart', 'Sally Ride', 'Bessie Coleman', 'Harriet Quimby'], correctIndex: 0, category: 'History' },
	{ text: 'The Berlin Wall fell in which year?', answers: ['1989', '1991', '1985', '1979'], correctIndex: 0, category: 'History' },
	{ text: 'Which war was fought between the North and South in the USA?', answers: ['Civil War', 'Revolutionary War', 'World War I', 'Vietnam War'], correctIndex: 0, category: 'History' },
	{ text: 'Who was the first man on the moon?', answers: ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins'], correctIndex: 0, category: 'History' },

	// -------------------------------------------------------------------------
	// Category: Science
	// -------------------------------------------------------------------------
	{ text: 'Which planet is known as the Red Planet?', answers: ['Mars', 'Venus', 'Jupiter', 'Mercury'], correctIndex: 0, category: 'Science' },
	{ text: 'What is H2O commonly called?', answers: ['Water', 'Hydrogen', 'Oxygen', 'Steam'], correctIndex: 0, category: 'Science' },
	{ text: 'Which gas do plants absorb?', answers: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], correctIndex: 0, category: 'Science' },
	{ text: 'What is the largest organ in the human body?', answers: ['Skin', 'Liver', 'Heart', 'Brain'], correctIndex: 0, category: 'Science' },
	{ text: 'How many bones does an adult human have?', answers: ['206', '200', '210', '250'], correctIndex: 0, category: 'Science' },
	{ text: 'What is the center of an atom called?', answers: ['Nucleus', 'Proton', 'Electron', 'Neutron'], correctIndex: 0, category: 'Science' },
	{ text: 'Which planet is the largest in our solar system?', answers: ['Jupiter', 'Saturn', 'Neptune', 'Earth'], correctIndex: 0, category: 'Science' },
	{ text: 'What force keeps us on the ground?', answers: ['Gravity', 'Magnetism', 'Friction', 'Inertia'], correctIndex: 0, category: 'Science' },
	{ text: 'What is the speed of light faster than?', answers: ['Speed of sound', 'Speed of gravity', 'Speed of thought', 'None'], correctIndex: 0, category: 'Science' },
	{ text: 'Which blood type is the universal donor?', answers: ['O Negative', 'A Positive', 'B Negative', 'AB Positive'], correctIndex: 0, category: 'Science' },
	{ text: 'What part of the plant conducts photosynthesis?', answers: ['Leaf', 'Root', 'Stem', 'Flower'], correctIndex: 0, category: 'Science' },
	{ text: 'How many hearts does an octopus have?', answers: ['3', '1', '2', '4'], correctIndex: 0, category: 'Science' },

	// -------------------------------------------------------------------------
	// Category: Geography
	// -------------------------------------------------------------------------
	{ text: 'What is the capital of France?', answers: ['Paris', 'Lyon', 'Marseille', 'Nice'], correctIndex: 0, category: 'Geography' },
	{ text: 'How many continents are there?', answers: ['7', '6', '5', '8'], correctIndex: 0, category: 'Geography' },
	{ text: 'Which is the largest ocean?', answers: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'], correctIndex: 0, category: 'Geography' },
	{ text: 'What country has the most population?', answers: ['India', 'China', 'USA', 'Russia'], correctIndex: 0, category: 'Geography' },
	{ text: 'The Great Barrier Reef is located in which country?', answers: ['Australia', 'Brazil', 'Thailand', 'Mexico'], correctIndex: 0, category: 'Geography' },
	{ text: 'Which river flows through Egypt?', answers: ['Nile', 'Amazon', 'Mississippi', 'Danube'], correctIndex: 0, category: 'Geography' },
	{ text: 'What is the smallest country in the world?', answers: ['Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'], correctIndex: 0, category: 'Geography' },
	{ text: 'Mount Everest is located in which mountain range?', answers: ['Himalayas', 'Andes', 'Alps', 'Rockies'], correctIndex: 0, category: 'Geography' },
	{ text: 'What is the capital of Canada?', answers: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'], correctIndex: 0, category: 'Geography' },
	{ text: 'Which state is known as the Sunshine State?', answers: ['Florida', 'California', 'Hawaii', 'Texas'], correctIndex: 0, category: 'Geography' },
	{ text: 'The Sahara Desert is located on which continent?', answers: ['Africa', 'Asia', 'South America', 'Australia'], correctIndex: 0, category: 'Geography' },
	{ text: 'What is the longest river in South America?', answers: ['Amazon', 'Orinoco', 'Parana', 'Magdalena'], correctIndex: 0, category: 'Geography' },

	// -------------------------------------------------------------------------
	// Category: Sports
	// -------------------------------------------------------------------------
	{ text: 'Which sport uses a shuttlecock?', answers: ['Badminton', 'Tennis', 'Squash', 'Ping Pong'], correctIndex: 0, category: 'Sports' },
	{ text: 'How long is a marathon?', answers: ['26.2 miles', '20 miles', '13.1 miles', '30 miles'], correctIndex: 0, category: 'Sports' },
	{ text: "In soccer, what body part can't touch the ball (except goalie)?", answers: ['Hands', 'Head', 'Chest', 'Feet'], correctIndex: 0, category: 'Sports' },
	{ text: 'Which country won the first FIFA World Cup?', answers: ['Uruguay', 'Brazil', 'Argentina', 'Italy'], correctIndex: 0, category: 'Sports' },
	{ text: 'How many players are on a basketball team on the court?', answers: ['5', '6', '7', '11'], correctIndex: 0, category: 'Sports' },
	{ text: 'Which grand slam is played on clay?', answers: ['French Open', 'Wimbledon', 'US Open', 'Australian Open'], correctIndex: 0, category: 'Sports' },
	{ text: 'In golf, what is a score of one under par called?', answers: ['Birdie', 'Eagle', 'Bogey', 'Albatross'], correctIndex: 0, category: 'Sports' },
	{ text: 'How many rings are in the Olympic logo?', answers: ['5', '4', '6', '7'], correctIndex: 0, category: 'Sports' },
	{ text: "Which sport is known as America's Pastime?", answers: ['Baseball', 'Football', 'Basketball', 'Soccer'], correctIndex: 0, category: 'Sports' },
	{ text: 'Who has won the most Olympic gold medals?', answers: ['Michael Phelps', 'Usain Bolt', 'Simone Biles', 'Mark Spitz'], correctIndex: 0, category: 'Sports' },
	{ text: 'What is the championship trophy in the NHL called?', answers: ['Stanley Cup', 'Lombardi Trophy', 'World Cup', "Larry O'Brien Trophy"], correctIndex: 0, category: 'Sports' },
	{ text: 'In bowling, what is it called when you knock down all pins at once?', answers: ['Strike', 'Spare', 'Turkey', 'Split'], correctIndex: 0, category: 'Sports' },

	// -------------------------------------------------------------------------
	// Category: Literature / Arts
	// -------------------------------------------------------------------------
	{ text: 'Who wrote Romeo and Juliet?', answers: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Who painted the Mona Lisa?', answers: ['Leonardo da Vinci', 'Michelangelo', 'Van Gogh', 'Picasso'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'What is the name of the hobbit in Lord of the Rings?', answers: ['Frodo Baggins', 'Harry Potter', 'Luke Skywalker', 'Bilbo Baggins'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Who wrote To Kill a Mockingbird?', answers: ['Harper Lee', 'Ernest Hemingway', 'F. Scott Fitzgerald', 'John Steinbeck'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'The Starry Night was painted by whom?', answers: ['Vincent van Gogh', 'Claude Monet', 'Salvador Dali', 'Rembrandt'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'What is the Japanese art of paper folding called?', answers: ['Origami', 'Ikebana', 'Haiku', 'Sudoku'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Who wrote the Harry Potter series?', answers: ['J.K. Rowling', 'Stephen King', 'George R.R. Martin', 'C.S. Lewis'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Which color is absent from the flag of the United States?', answers: ['Gold', 'Red', 'White', 'Blue'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Who sculpted David?', answers: ['Michelangelo', 'Donatello', 'Raphael', 'Leonardo'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Sherlock Holmes lived at which address?', answers: ['221B Baker St', '10 Downing St', '4 Privet Drive', '12 Grimmauld Place'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Who wrote 1984?', answers: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'H.G. Wells'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'What are the three primary colors?', answers: ['Red, Blue, Yellow', 'Green, Orange, Purple', 'Red, Green, Blue', 'Black, White, Grey'], correctIndex: 0, category: 'LiteratureArts' },

	// -------------------------------------------------------------------------
	// Category: Food
	// -------------------------------------------------------------------------
	{ text: 'What is the main ingredient in guacamole?', answers: ['Avocado', 'Tomato', 'Onion', 'Pepper'], correctIndex: 0, category: 'Food' },
	{ text: 'Sushi traditionally comes from which country?', answers: ['Japan', 'China', 'Thailand', 'Vietnam'], correctIndex: 0, category: 'Food' },
	{ text: 'What is the sweet substance made by bees?', answers: ['Honey', 'Nectar', 'Pollen', 'Syrup'], correctIndex: 0, category: 'Food' },
	{ text: 'Which fruit has seeds on the outside?', answers: ['Strawberry', 'Apple', 'Banana', 'Kiwi'], correctIndex: 0, category: 'Food' },
	{ text: 'What grain is used to make risotto?', answers: ['Rice', 'Wheat', 'Quinoa', 'Barley'], correctIndex: 0, category: 'Food' },
	{ text: 'What is the main ingredient in hummus?', answers: ['Chickpeas', 'Lentils', 'Beans', 'Peas'], correctIndex: 0, category: 'Food' },
	{ text: 'Which country produces the most coffee?', answers: ['Brazil', 'Colombia', 'Vietnam', 'Ethiopia'], correctIndex: 0, category: 'Food' },
	{ text: 'What is the spicy green paste eaten with sushi?', answers: ['Wasabi', 'Ginger', 'Mustard', 'Chili'], correctIndex: 0, category: 'Food' },
	{ text: 'Which nut is used to make marzipan?', answers: ['Almond', 'Walnut', 'Peanut', 'Cashew'], correctIndex: 0, category: 'Food' },
	{ text: 'What is the main ingredient in chocolate?', answers: ['Cocoa beans', 'Milk', 'Sugar', 'Vanilla'], correctIndex: 0, category: 'Food' },
	{ text: 'Which cheese is used on pizza usually?', answers: ['Mozzarella', 'Cheddar', 'Brie', 'Gouda'], correctIndex: 0, category: 'Food' },
	{ text: 'What type of pasta looks like bow ties?', answers: ['Farfalle', 'Penne', 'Fusilli', 'Linguine'], correctIndex: 0, category: 'Food' },
];

/**@deprecated */
export const ADVICE: string[] = ['Start your day with a clear intention.', 'Small steps lead to big changes.', 'Focus on what you can control today.', 'Break large goals into tiny habits.', 'Progress over perfection.', 'Rest is part of productivity.', 'Be kind to yourself today.', 'One day at a time.', 'You are stronger than you think.', 'Celebrate small wins.', 'Consistency beats intensity.', 'Today is a fresh start.'];

/**@deprecated */
export const QUOTES: string[] = [
	'The only way to do great work is to love what you do. - Steve Jobs',
	'Success is not final, failure is not fatal. - Winston Churchill',
	"You miss 100% of the shots you don't take. - Wayne Gretzky",
	'The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb',
	'It does not matter how slowly you go as long as you do not stop. - Confucius',
	'Everything you want is on the other side of fear. - George Addair',
	'You are never too old to set another goal or to dream a new dream. - C.S. Lewis',
	'The only impossible journey is the one you never begin. - Tony Robbins',
	'What we think, we become. - Buddha',
	'Act as if what you do makes a difference. It does. - William James',
];

export default PROMPTS;
