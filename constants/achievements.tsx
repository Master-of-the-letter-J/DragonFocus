export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'surveys' | 'dragon_stats' | 'coins' | 'journal' | 'age' | 'scar' | 'challenges' | 'secret';
  icon: string; // emoji or icon name
  unlocked: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Surveys
  { id: 'egg_cracker', title: 'Egg Cracker', description: 'Complete first morning survey', category: 'surveys', icon: '🐣', unlocked: false },
  { id: 'night_owl', title: 'Night Owl Whisperer', description: 'Complete first night survey', category: 'surveys', icon: '🌙', unlocked: false },
  { id: 'balanced_yin', title: 'Balanced Yin', description: 'Complete both surveys in one day', category: 'surveys', icon: '☯️', unlocked: false },
  { id: 'routine_ruler', title: 'Routine Ruler', description: '7-day streak', category: 'surveys', icon: '🏆', unlocked: false },
  { id: 'dragon_monk', title: 'Dragon Monk', description: '30-day streak', category: 'surveys', icon: '🧘', unlocked: false },
  { id: 'eternal_flame', title: 'The Eternal Flame', description: '100-day streak', category: 'surveys', icon: '🔥', unlocked: false },
  { id: 'unbroken_spirit', title: 'Unbroken Spirit', description: '365-day streak', category: 'surveys', icon: '✨', unlocked: false },
  { id: 'speedrunner', title: 'Survey Speedrunner', description: 'Finish a survey in under 30 seconds', category: 'surveys', icon: '⚡', unlocked: false },
  { id: 'deep_thinker', title: 'Deep Thinker', description: 'Spend 3+ minutes on a survey', category: 'surveys', icon: '🤔', unlocked: false },
  { id: 'prompt_philosopher', title: 'Prompt Philosopher', description: 'Write 50 journal entries', category: 'surveys', icon: '📝', unlocked: false },
  { id: 'checklist_champion', title: 'Checklist Champion', description: 'Complete 500 checklist items', category: 'surveys', icon: '✅', unlocked: false },
  { id: 'goal_slayer', title: 'Goal Slayer', description: 'Complete 100 short-answer goals', category: 'surveys', icon: '🎯', unlocked: false },

  // Dragon Stats
  { id: 'medic', title: 'Medic!', description: 'Heal from low HP to full', category: 'dragon_stats', icon: '💊', unlocked: false },
  { id: 'iron_scales', title: 'Iron Scales', description: 'Keep HP above 90% for 30 days', category: 'dragon_stats', icon: '🛡️', unlocked: false },
  { id: 'walking_icu', title: 'Walking ICU', description: 'Drop below 10% HP', category: 'dragon_stats', icon: '😰', unlocked: false },
  { id: 'zen_master', title: 'Zen Master', description: 'Maintain low Fury for 7 days', category: 'dragon_stats', icon: '🧘‍♀️', unlocked: false },
  { id: 'chaos_incarnate', title: 'Chaos Incarnate', description: 'Reach 100 Fury', category: 'dragon_stats', icon: '💥', unlocked: false },
  { id: 'fire_hazard', title: 'Fire Hazard', description: 'Reach 100 Fury three times', category: 'dragon_stats', icon: '🔥', unlocked: false },
  { id: 'dragon_therapist', title: 'Dragon Therapist', description: 'Reduce Fury from 100 → 0 in one day', category: 'dragon_stats', icon: '🧠', unlocked: false },

  // Coins & Clicking
  { id: 'coin_collector', title: 'Coin Collector', description: 'Earn 1,000 coins', category: 'coins', icon: '🪙', unlocked: false },
  { id: 'treasure_hoarder', title: 'Treasure Hoarder', description: 'Earn 10,000 coins', category: 'coins', icon: '💰', unlocked: false },
  { id: 'millionaire', title: 'Draconic Millionaire', description: 'Earn 100,000 coins', category: 'coins', icon: '🤑', unlocked: false },
  { id: 'clicking_gremlin', title: 'Clicking Gremlin', description: 'Hit daily click limit', category: 'coins', icon: '👹', unlocked: false },
  { id: 'finger_of_steel', title: 'Finger of Steel', description: 'Tap dragon 10,000 times', category: 'coins', icon: '👆', unlocked: false },

  // Shop & Cosmetics
  { id: 'snack_sampler', title: 'Snack Sampler', description: 'Buy 10 snacks', category: 'journal', icon: '🍿', unlocked: false },
  { id: 'snack_connoisseur', title: 'Snack Connoisseur', description: 'Buy every snack type', category: 'journal', icon: '👨‍🍳', unlocked: false },
  { id: 'fashion_dragon', title: 'Fashion Dragon', description: 'Equip first cosmetic', category: 'journal', icon: '👗', unlocked: false },
  { id: 'drip_overload', title: 'Drip Overload', description: 'Equip 5 cosmetics at once', category: 'journal', icon: '✨', unlocked: false },
  { id: 'drip_god', title: 'Draconic Drip God', description: 'Own every cosmetic', category: 'journal', icon: '👑', unlocked: false },

  // Journal & Schedule
  { id: 'dear_diary', title: 'Dear Diary…', description: 'Write first journal entry', category: 'journal', icon: '📔', unlocked: false },
  { id: 'ink_mage', title: 'Ink Mage', description: 'Write 100 journal entries', category: 'journal', icon: '✒️', unlocked: false },
  { id: 'archivist', title: 'Archivist', description: 'View 100 past entries', category: 'journal', icon: '📚', unlocked: false },
  { id: 'planner_beginner', title: 'Planner Beginner', description: 'Create first schedule', category: 'journal', icon: '📅', unlocked: false },
  { id: 'time_wizard', title: 'Time Wizard', description: 'Complete 100 scheduled tasks', category: 'journal', icon: '⏰', unlocked: false },
  { id: 'master_of_time', title: 'Master of Time', description: 'Complete 500 scheduled tasks', category: 'journal', icon: '⌛', unlocked: false },

  // Mood Tracking
  { id: 'emotional_explorer', title: 'Emotional Explorer', description: 'Log 10 moods', category: 'dragon_stats', icon: '😊', unlocked: false },
  { id: 'mood_master', title: 'Mood Master', description: 'Log 100 moods', category: 'dragon_stats', icon: '😎', unlocked: false },
  { id: 'emotional_roller', title: 'Emotional Rollercoaster', description: 'Log every mood type', category: 'dragon_stats', icon: '🎢', unlocked: false },
  { id: 'stoic_dragon', title: 'Stoic Dragon', description: 'Log same mood 7 days in a row', category: 'dragon_stats', icon: '🗿', unlocked: false },

  // Dragon Age
  { id: 'its_alive', title: "It's Alive!", description: 'Hatch dragon', category: 'age', icon: '🎉', unlocked: false },
  { id: 'tiny_terror', title: 'Tiny Terror', description: 'Reach Hatchling', category: 'age', icon: '🐣', unlocked: false },
  { id: 'little_flame', title: 'Little Flame', description: 'Reach Dragonet', category: 'age', icon: '🔥', unlocked: false },
  { id: 'skybound_teen', title: 'Skybound Teen', description: 'Reach Juvenile', category: 'age', icon: '🌤️', unlocked: false },
  { id: 'young_inferno', title: 'Young Inferno', description: 'Reach Young Adult', category: 'age', icon: '🔥', unlocked: false },
  { id: 'ancient_scales', title: 'Ancient Scales', description: 'Reach Elder Dragon', category: 'age', icon: '👑', unlocked: false },
  { id: 'wyrm_ascendant', title: 'Wyrm Ascendant', description: 'Reach Wyrm', category: 'age', icon: '🐲', unlocked: false },
  { id: 'name_of_power', title: 'Name of Power', description: 'Rename Wyrm', category: 'age', icon: '🏷️', unlocked: false },

  // Scar Levels
  { id: 'marked_by_fire', title: 'Marked by Fire', description: 'Reach Scar Level 1', category: 'scar', icon: '🔥', unlocked: false },
  { id: 'battle_hardened', title: 'Battle-Hardened', description: 'Reach Scar Level 3', category: 'scar', icon: '⚔️', unlocked: false },
  { id: 'dragon_pact', title: 'Dragon Pact', description: 'Reach Scar Level 5', category: 'scar', icon: '✨', unlocked: false },
  { id: 'legend_of_scars', title: 'Legend of Scars', description: 'Reach Scar Level 10', category: 'scar', icon: '⭐', unlocked: false },
  { id: 'ultimate_warrior', title: 'Ultimate Dragon Warrior', description: 'Reach final XP tier', category: 'scar', icon: '🏆', unlocked: false },

  // Challenges
  { id: 'perfect_day', title: 'Perfect Day', description: '100% checklist + 100% schedule + 0 Fury', category: 'challenges', icon: '✨', unlocked: false },
  { id: 'impossible_day', title: 'The Impossible Day', description: '100% checklist + 100% schedule + 100 Fury', category: 'challenges', icon: '🤯', unlocked: false },
  { id: 'fire_juggler', title: 'Fire Juggler', description: 'Maintain Fury 40–60 for 7 days', category: 'challenges', icon: '🤹', unlocked: false },
  { id: 'yin_yang_master', title: 'The Yin‑Yang Master', description: 'Keep Fury exactly at 50', category: 'challenges', icon: '☯️', unlocked: false },

  // Secret Achievements
  { id: 'grandma_glock', title: 'Grandma Does Not Have a Glock', description: 'Open app 100 times', category: 'secret', icon: '🔫', unlocked: false },
  { id: 'forbidden_snack', title: 'The Forbidden Snack', description: 'Use a snack at exactly 69 Fury', category: 'secret', icon: '🍆', unlocked: false },
  { id: 'ritual', title: 'The Ritual', description: 'Do morning survey between 4:44 to 5:55 AM', category: 'secret', icon: '🕯️', unlocked: false },
  { id: 'night_watcher', title: 'The Night Watcher', description: 'Do night survey between 11:11-11:59 PM', category: 'secret', icon: '🌙', unlocked: false },
  { id: 'dragon_whisperer', title: 'The Dragon Whisperer', description: 'Tap dragon 1,111 times', category: 'secret', icon: '🤫', unlocked: false },
  { id: 'true_flame', title: 'The True Flame', description: 'Maintain streak through a holiday', category: 'secret', icon: '🔥', unlocked: false },
  { id: 'chosen_one', title: 'The Chosen One', description: 'End day with exactly 777 coins', category: 'secret', icon: '7️⃣', unlocked: false },
  { id: 'accountant', title: 'The Accountant', description: 'End day with 0 coins', category: 'secret', icon: '📊', unlocked: false },
];

export default ACHIEVEMENTS;
