import type { QuestionSettings } from '@/context/QuestionProvider';

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

const compact = (value: string) => value.replace(/\s+/g, ' ').trim();

const PROMPT_FRAMES = [
	(subject: string) => `Write about ${subject}.`,
	(subject: string) => `Describe why ${subject} matters to you right now.`,
	(subject: string) => `Reflect on how ${subject} has shaped this week.`,
	(subject: string) => `Give a real example of ${subject} from your life.`,
	(subject: string) => `List three details connected to ${subject}.`,
	(subject: string) => `What feels challenging about ${subject}?`,
	(subject: string) => `What feels hopeful about ${subject}?`,
	(subject: string) => `What is one action you could take around ${subject}?`,
	(subject: string) => `How would you explain ${subject} to someone who knows you well?`,
	(subject: string) => `What has changed about ${subject} over time?`,
	(subject: string) => `What would your future self notice about ${subject}?`,
];

const buildPromptPool = (category: WrittenPrompt['category'], subjects: string[]): WrittenPrompt[] => {
	const items: WrittenPrompt[] = [];
	for (const subject of subjects) {
		for (const frame of PROMPT_FRAMES) {
			items.push({
				text: compact(frame(subject)),
				category,
			});
		}
	}
	return items;
};

const SELF_DISCOVERY_SUBJECTS = [
	'a belief you are outgrowing',
	'a strength you underestimate',
	'a fear that still shapes your choices',
	'a boundary you need to protect',
	'a value you refuse to trade away',
	'a version of yourself you miss',
	'a truth you are learning to accept',
	'an identity you are growing into',
	'a pattern you want to break',
	'a dream you do not want to abandon',
];

const REFLECTION_SUBJECTS = [
	'a moment from today that stayed with you',
	'a choice you made this week',
	'a mistake that taught you something',
	'a win that deserved more credit',
	'a conversation you keep replaying',
	'a habit that helped you recently',
	'a situation that tested your patience',
	'a time you surprised yourself',
	'an emotion that showed up often lately',
	'a lesson this month keeps repeating',
];

const GRATITUDE_SUBJECTS = [
	'a person who made life easier',
	'a comfort you usually overlook',
	'a challenge that secretly helped you',
	'a place that calms you',
	'a routine that supports you',
	'a skill your past self worked hard to build',
	'a meal or resource that nourished you',
	'a piece of technology that genuinely helps you',
	'a memory that still warms you',
	'a quality in yourself that deserves thanks',
];

const CREATIVE_SUBJECTS = [
	'a story idea you keep circling',
	'a color palette that matches your mood',
	'a character inspired by your week',
	'a project that wants more play',
	'a scene you can picture vividly',
	'a sound or rhythm worth exploring',
	'a design idea you want to test',
	'a strange combination that feels inspiring',
	'a creative risk that excites you',
	'a tiny artistic habit worth growing',
];

const MINDFULNESS_SUBJECTS = [
	'the pace of your breathing',
	'the tension in your body',
	'the sounds around you',
	'the light in your space',
	'the first emotion you noticed today',
	'the texture of your current environment',
	'the way your energy changes through the day',
	'a sensation you normally ignore',
	'the quietest moment you had today',
	'the difference between rushing and slowing down',
];

const PRODUCTIVITY_SUBJECTS = [
	'your highest-value task',
	'a distraction that keeps stealing time',
	'a project that needs a smaller next step',
	'the part of your workflow that feels heavy',
	'a task you keep postponing',
	'the best use of your next 20 minutes',
	'a system that would simplify your week',
	'an obligation you may need to renegotiate',
	'a routine that creates momentum',
	'the moment you feel most focused',
];

const RELATIONSHIP_SUBJECTS = [
	'a conversation that needs care',
	'a person you want to appreciate more openly',
	'a boundary that could protect a relationship',
	'the way you show support',
	'a misunderstanding worth clearing up',
	'a relationship that helps you grow',
	'someone you miss hearing from',
	'a quality you admire in someone close',
	'a recent moment of connection',
	'the kind of friendship you want to build',
];

export const PROMPTS: WrittenPrompt[] = [
	...buildPromptPool('SelfDiscovery', SELF_DISCOVERY_SUBJECTS),
	...buildPromptPool('Reflection', REFLECTION_SUBJECTS),
	...buildPromptPool('Gratitude', GRATITUDE_SUBJECTS),
	...buildPromptPool('Creative', CREATIVE_SUBJECTS),
	...buildPromptPool('Mindfulness', MINDFULNESS_SUBJECTS),
	...buildPromptPool('Productivity', PRODUCTIVITY_SUBJECTS),
	...buildPromptPool('Relationships', RELATIONSHIP_SUBJECTS),
];

export const TRIVIA: TriviaQuestion[] = [
	{ text: 'How many minutes are in an hour?', answers: ['60', '50', '45', '30'], correctIndex: 0, category: 'General' },
	{ text: 'How many seconds are in 5 minutes?', answers: ['300', '250', '200', '150'], correctIndex: 0, category: 'General' },
	{ text: 'Which month has 28 days?', answers: ['All of them', 'February', 'January', 'March'], correctIndex: 0, category: 'General' },
	{ text: 'What currency is used in Japan?', answers: ['Yen', 'Won', 'Dollar', 'Yuan'], correctIndex: 0, category: 'General' },
	{ text: 'How many weeks are in a year?', answers: ['52', '48', '50', '54'], correctIndex: 0, category: 'General' },
	{ text: 'What is the freezing point of water in Celsius?', answers: ['0', '32', '100', '-10'], correctIndex: 0, category: 'General' },
	{ text: 'Which Disney movie features Elsa?', answers: ['Frozen', 'Moana', 'Tangled', 'Brave'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Who lives in a pineapple under the sea?', answers: ['SpongeBob SquarePants', 'Patrick Star', 'Squidward', 'Mr. Krabs'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Which house does Harry Potter belong to?', answers: ['Gryffindor', 'Slytherin', 'Hufflepuff', 'Ravenclaw'], correctIndex: 0, category: 'PopCulture' },
	{ text: "What is the name of Han Solo's ship?", answers: ['Millennium Falcon', 'X-Wing', 'TIE Fighter', 'Death Star'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Who is the alter ego of Spider-Man?', answers: ['Peter Parker', 'Bruce Wayne', 'Clark Kent', 'Tony Stark'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'Which superhero is known as the Dark Knight?', answers: ['Batman', 'Superman', 'Flash', 'Green Lantern'], correctIndex: 0, category: 'PopCulture' },
	{ text: 'What year did the Titanic sink?', answers: ['1912', '1905', '1915', '1920'], correctIndex: 0, category: 'History' },
	{ text: 'Who was the first President of the United States?', answers: ['George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'John Adams'], correctIndex: 0, category: 'History' },
	{ text: 'Which ancient civilization built the pyramids?', answers: ['Egyptians', 'Romans', 'Greeks', 'Mayans'], correctIndex: 0, category: 'History' },
	{ text: 'In which year did World War II end?', answers: ['1945', '1939', '1918', '1950'], correctIndex: 0, category: 'History' },
	{ text: 'Who was the first woman to fly solo across the Atlantic?', answers: ['Amelia Earhart', 'Sally Ride', 'Bessie Coleman', 'Harriet Quimby'], correctIndex: 0, category: 'History' },
	{ text: 'The Berlin Wall fell in which year?', answers: ['1989', '1991', '1985', '1979'], correctIndex: 0, category: 'History' },
	{ text: 'Which planet is known as the Red Planet?', answers: ['Mars', 'Venus', 'Jupiter', 'Mercury'], correctIndex: 0, category: 'Science' },
	{ text: 'What is H2O commonly called?', answers: ['Water', 'Hydrogen', 'Oxygen', 'Steam'], correctIndex: 0, category: 'Science' },
	{ text: 'Which gas do plants absorb?', answers: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], correctIndex: 0, category: 'Science' },
	{ text: 'What is the largest organ in the human body?', answers: ['Skin', 'Liver', 'Heart', 'Brain'], correctIndex: 0, category: 'Science' },
	{ text: 'How many bones does an adult human have?', answers: ['206', '200', '210', '250'], correctIndex: 0, category: 'Science' },
	{ text: 'How many hearts does an octopus have?', answers: ['3', '1', '2', '4'], correctIndex: 0, category: 'Science' },
	{ text: 'What is the capital of France?', answers: ['Paris', 'Lyon', 'Marseille', 'Nice'], correctIndex: 0, category: 'Geography' },
	{ text: 'How many continents are there?', answers: ['7', '6', '5', '8'], correctIndex: 0, category: 'Geography' },
	{ text: 'Which is the largest ocean?', answers: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'], correctIndex: 0, category: 'Geography' },
	{ text: 'The Great Barrier Reef is located in which country?', answers: ['Australia', 'Brazil', 'Thailand', 'Mexico'], correctIndex: 0, category: 'Geography' },
	{ text: 'What is the capital of Canada?', answers: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'], correctIndex: 0, category: 'Geography' },
	{ text: 'The Sahara Desert is located on which continent?', answers: ['Africa', 'Asia', 'South America', 'Australia'], correctIndex: 0, category: 'Geography' },
	{ text: 'Which sport uses a shuttlecock?', answers: ['Badminton', 'Tennis', 'Squash', 'Ping Pong'], correctIndex: 0, category: 'Sports' },
	{ text: 'How long is a marathon?', answers: ['26.2 miles', '20 miles', '13.1 miles', '30 miles'], correctIndex: 0, category: 'Sports' },
	{ text: 'How many players are on a basketball team on the court?', answers: ['5', '6', '7', '11'], correctIndex: 0, category: 'Sports' },
	{ text: 'Which grand slam is played on clay?', answers: ['French Open', 'Wimbledon', 'US Open', 'Australian Open'], correctIndex: 0, category: 'Sports' },
	{ text: 'How many rings are in the Olympic logo?', answers: ['5', '4', '6', '7'], correctIndex: 0, category: 'Sports' },
	{ text: "Which sport is known as America's Pastime?", answers: ['Baseball', 'Football', 'Basketball', 'Soccer'], correctIndex: 0, category: 'Sports' },
	{ text: 'Who wrote Romeo and Juliet?', answers: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Who painted the Mona Lisa?', answers: ['Leonardo da Vinci', 'Michelangelo', 'Van Gogh', 'Picasso'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Who wrote To Kill a Mockingbird?', answers: ['Harper Lee', 'Ernest Hemingway', 'F. Scott Fitzgerald', 'John Steinbeck'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'What is the Japanese art of paper folding called?', answers: ['Origami', 'Ikebana', 'Haiku', 'Sudoku'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Who wrote 1984?', answers: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'H.G. Wells'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'Sherlock Holmes lived at which address?', answers: ['221B Baker St', '10 Downing St', '4 Privet Drive', '12 Grimmauld Place'], correctIndex: 0, category: 'LiteratureArts' },
	{ text: 'What is the main ingredient in guacamole?', answers: ['Avocado', 'Tomato', 'Onion', 'Pepper'], correctIndex: 0, category: 'Food' },
	{ text: 'Sushi traditionally comes from which country?', answers: ['Japan', 'China', 'Thailand', 'Vietnam'], correctIndex: 0, category: 'Food' },
	{ text: 'What is the sweet substance made by bees?', answers: ['Honey', 'Nectar', 'Pollen', 'Syrup'], correctIndex: 0, category: 'Food' },
	{ text: 'Which fruit has seeds on the outside?', answers: ['Strawberry', 'Apple', 'Banana', 'Kiwi'], correctIndex: 0, category: 'Food' },
	{ text: 'What is the spicy green paste eaten with sushi?', answers: ['Wasabi', 'Ginger', 'Mustard', 'Chili'], correctIndex: 0, category: 'Food' },
	{ text: 'What type of pasta looks like bow ties?', answers: ['Farfalle', 'Penne', 'Fusilli', 'Linguine'], correctIndex: 0, category: 'Food' },
];

export default PROMPTS;
