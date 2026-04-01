export interface Quote {
	text: string;
	author?: string;
	category: 'inspirational' | 'witty' | 'philosophical';
}

const compact = (value: string) => value.replace(/\s+/g, ' ').trim();

const uniqueByText = (items: Quote[]) => {
	const seen = new Set<string>();
	return items.filter(item => {
		if (seen.has(item.text)) return false;
		seen.add(item.text);
		return true;
	});
};

const buildQuotePool = (category: Quote['category'], openings: string[], endings: string[]): Quote[] => {
	const items: Quote[] = [];
	for (const opening of openings) {
		for (const ending of endings) {
			items.push({
				text: compact(`${opening} ${ending}`),
				category,
			});
		}
	}
	return uniqueByText(items);
};

const INSPIRATIONAL_QUOTES = buildQuotePool(
	'inspirational',
	[
		'Start where you are',
		'Give your next step your full attention',
		'Trust the small effort in front of you',
		'Let today be simple but real',
		'Keep showing up for the version of you that is growing',
		'Use discipline as a form of self-respect',
		'Choose the useful action over the dramatic excuse',
		'Carry your focus gently',
		'Build momentum before you chase perfection',
		'Respect the progress that quiet work creates',
		'Keep faith with the person you are becoming',
		'Take the honest first step',
		'Protect the habits that keep you steady',
		'Let your routine become proof of your commitment',
		'Remember that effort compounds',
	],
	[
		'and let consistency do the heavy lifting.',
		'because progress likes ordinary days.',
		'and your future will notice the difference.',
		'because courage is often just repetition with heart.',
		'and the path will look clearer after you move.',
		'because tiny wins are still wins.',
		'and let your habits argue louder than your doubts.',
		'because momentum begins long before confidence arrives.',
		'and trust that the quiet version of progress still counts.',
		'because your direction matters more than your speed.',
		'and give yourself credit for choosing growth again.',
		'because one clear action can change the whole tone of a day.',
		'and let discipline feel supportive instead of punishing.',
		'because your effort is building something real.',
	],
);

const WITTY_QUOTES = buildQuotePool(
	'witty',
	[
		'Your to-do list would calm down',
		'Productivity gets a lot less mysterious',
		'Even the dragon knows',
		'Future-you keeps requesting',
		'The problem with procrastination is not subtle',
		'Motivation behaves better',
		'Your browser tabs are not a personality trait',
		'Some plans become legendary',
		'Chaos gets surprisingly organized',
		'The universe sends fewer mixed messages',
		'Low energy stops being a villain',
		'Overthinking loses most of its sparkle',
		'Time management becomes less tragic',
		'A decent routine feels almost magical',
		'The drama level drops immediately',
	],
	[
		'when you stop pretending every task is equally urgent.',
		'when the next step is written in human language.',
		'that vague goals are just chores in disguise.',
		'that you define the task before negotiating with the couch.',
		'when you finish one thing before reorganizing everything.',
		'once your plan survives contact with real life.',
		'when your reminder system is not just panic.',
		'after you admit that perfection is a stalling tactic.',
		'when the hard part is smaller than the excuse.',
		'once your checklist stops auditioning for a tragedy.',
		'when you turn a mountain into a staircase.',
		'after you stop using stress as a scheduling method.',
		'when your ambition learns to share space with realism.',
		'once you stop treating rest like a clerical error.',
	],
);

const PHILOSOPHICAL_QUOTES = buildQuotePool(
	'philosophical',
	[
		'Meaning becomes easier to notice',
		'Attention changes the world you inhabit',
		'Identity is shaped quietly',
		'Clarity usually arrives',
		'The self becomes visible',
		'Time feels different',
		'Reality looks softer and sharper at once',
		'Wisdom grows',
		'The present moment becomes larger',
		'Patterns reveal themselves',
		'Discipline changes character',
		'Truth feels less threatening',
		'Freedom becomes practical',
		'Change stops feeling abstract',
		'Reflection becomes honest',
	],
	[
		'when you stop rushing past what matters.',
		'when you choose what deserves your notice.',
		'through repetition more than revelation.',
		'after honesty, not before it.',
		'when its habits are easier to see than its intentions.',
		'once you measure it with care instead of fear.',
		'when you stop demanding certainty from it.',
		'when ego becomes less interesting than reality.',
		'after you quit treating every emotion as a command.',
		'when you stop arguing with what is already true.',
		'once values and actions begin to align.',
		'when silence is allowed to say something useful.',
		'after you learn the difference between urgency and importance.',
		'when you accept that becoming is a daily process.',
	],
);

const CURATED_QUOTES: Quote[] = [
	{ text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'inspirational' },
	{ text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'inspirational' },
	{ text: "You do not have to see the whole staircase, just the first step.", author: 'Martin Luther King Jr.', category: 'inspirational' },
	{ text: "I am so clever that sometimes I do not understand a single word of what I am saying.", author: 'Oscar Wilde', category: 'witty' },
	{ text: "I am not arguing, I am just explaining why I am right.", category: 'witty' },
	{ text: "My bed is a magical place where I suddenly remember everything I forgot to do.", category: 'witty' },
	{ text: 'The unexamined life is not worth living.', author: 'Socrates', category: 'philosophical' },
	{ text: 'The only true wisdom is in knowing you know nothing.', author: 'Socrates', category: 'philosophical' },
	{ text: 'The present moment is the only place life actually happens.', category: 'philosophical' },
];

export const QUOTES: Quote[] = uniqueByText([...CURATED_QUOTES, ...INSPIRATIONAL_QUOTES, ...WITTY_QUOTES, ...PHILOSOPHICAL_QUOTES]);

export const ADVICE: string[] = QUOTES.filter(quote => quote.category === 'inspirational')
	.slice(0, 12)
	.map(quote => quote.text);

export default QUOTES;
