export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'surveys' | 'dragon_stats' | 'coins' | 'market' | 'journal' | 'age' | 'scar' | 'challenges' | 'secret';
  icon: string;
  unlocked: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Surveys
  { id: 'egg_cracker', title: 'Egg Cracker', description: 'Complete your first morning survey', category: 'surveys', icon: '\u{1F423}', unlocked: false },
  { id: 'night_owl', title: 'Night Owl Whisperer', description: 'Complete your first night survey', category: 'surveys', icon: '\u{1F319}', unlocked: false },
  { id: 'balanced_yin', title: 'Balanced Yin', description: 'Complete both surveys in one day', category: 'surveys', icon: '\u262F\uFE0F', unlocked: false },
  { id: 'routine_ruler', title: 'Routine Ruler', description: 'Reach a 7-day streak', category: 'surveys', icon: '\u{1F3C6}', unlocked: false },
  { id: 'dragon_monk', title: 'Dragon Monk', description: 'Reach a 30-day streak', category: 'surveys', icon: '\u{1F9D8}', unlocked: false },
  { id: 'eternal_flame', title: 'The Eternal Flame', description: 'Reach a 100-day streak', category: 'surveys', icon: '\u{1F525}', unlocked: false },
  { id: 'unbroken_spirit', title: 'Unbroken Spirit', description: 'Reach a 365-day streak', category: 'surveys', icon: '\u2728', unlocked: false },
  { id: 'speedrunner', title: 'Survey Speedrunner', description: 'Finish a survey in under 30 seconds', category: 'surveys', icon: '\u26A1', unlocked: false },
  { id: 'deep_thinker', title: 'Deep Thinker', description: 'Spend at least 3 minutes on a survey', category: 'surveys', icon: '\u{1F914}', unlocked: false },
  { id: 'prompt_philosopher', title: 'Prompt Philosopher', description: 'Write 50 journal entries', category: 'surveys', icon: '\u{1F4DD}', unlocked: false },
  { id: 'checklist_champion', title: 'Checklist Champion', description: 'Complete 500 goal checks', category: 'surveys', icon: '\u2705', unlocked: false },
  { id: 'goal_slayer', title: 'Goal Slayer', description: 'Complete 100 prompt or short-answer responses', category: 'surveys', icon: '\u{1F3AF}', unlocked: false },

  // Dragon Stats
  { id: 'medic', title: 'Medic!', description: 'Heal from low HP back to full', category: 'dragon_stats', icon: '\u{1F48A}', unlocked: false },
  { id: 'iron_scales', title: 'Iron Scales', description: 'Keep HP above 90 percent for 30 days', category: 'dragon_stats', icon: '\u{1F6E1}\uFE0F', unlocked: false },
  { id: 'walking_icu', title: 'Walking ICU', description: 'Drop below 10 percent HP', category: 'dragon_stats', icon: '\u{1F630}', unlocked: false },
  { id: 'zen_master', title: 'Zen Master', description: 'Maintain low Fury for 7 days', category: 'dragon_stats', icon: '\u{1F9D8}\u200D\u2640\uFE0F', unlocked: false },
  { id: 'chaos_incarnate', title: 'Chaos Incarnate', description: 'Reach 100 Fury', category: 'dragon_stats', icon: '\u{1F4A5}', unlocked: false },
  { id: 'fire_hazard', title: 'Fire Hazard', description: 'Reach 100 Fury three times', category: 'dragon_stats', icon: '\u{1F525}', unlocked: false },
  { id: 'dragon_therapist', title: 'Dragon Therapist', description: 'Reduce Fury from 100 to 0 in one day', category: 'dragon_stats', icon: '\u{1F9E0}', unlocked: false },

  // Coins & Clicking
  { id: 'coin_collector', title: 'Coin Collector', description: 'Earn 1,000 coins', category: 'coins', icon: '\u{1FA99}', unlocked: false },
  { id: 'treasure_hoarder', title: 'Treasure Hoarder', description: 'Earn 10,000 coins', category: 'coins', icon: '\u{1F4B0}', unlocked: false },
  { id: 'millionaire', title: 'Draconic Millionaire', description: 'Earn 100,000 coins', category: 'coins', icon: '\u{1F911}', unlocked: false },
  { id: 'clicking_gremlin', title: 'Clicking Gremlin', description: 'Hit the daily click limit', category: 'coins', icon: '\u{1F479}', unlocked: false },
  { id: 'finger_of_steel', title: 'Finger of Steel', description: 'Tap the dragon 10,000 times', category: 'coins', icon: '\u{1F446}', unlocked: false },

  // Market & Cosmetics
  { id: 'snack_sampler', title: 'Snack Sampler', description: 'Buy 10 snacks', category: 'market', icon: '\u{1F37F}', unlocked: false },
  { id: 'snack_connoisseur', title: 'Snack Connoisseur', description: 'Buy every snack type', category: 'market', icon: '\u{1F468}\u200D\u{1F373}', unlocked: false },
  { id: 'fashion_dragon', title: 'Fashion Dragon', description: 'Equip your first cosmetic', category: 'market', icon: '\u{1F457}', unlocked: false },
  { id: 'drip_overload', title: 'Drip Overload', description: 'Equip 5 cosmetics at once', category: 'market', icon: '\u2728', unlocked: false },
  { id: 'drip_god', title: 'Draconic Drip God', description: 'Own every cosmetic', category: 'market', icon: '\u{1F451}', unlocked: false },

  // Journal & Goal Tracking
  { id: 'dear_diary', title: 'Dear Diary', description: 'Write your first journal entry', category: 'journal', icon: '\u{1F4D4}', unlocked: false },
  { id: 'ink_mage', title: 'Ink Mage', description: 'Write 100 journal entries', category: 'journal', icon: '\u270D\uFE0F', unlocked: false },
  { id: 'archivist', title: 'Archivist', description: 'View 100 past entries', category: 'journal', icon: '\u{1F4DA}', unlocked: false },
  { id: 'planner_beginner', title: 'Planner Beginner', description: 'Create your first habit or to-do goal', category: 'journal', icon: '\u{1F4C5}', unlocked: false },
  { id: 'time_wizard', title: 'Time Wizard', description: 'Complete 100 tracked goals', category: 'journal', icon: '\u23F0', unlocked: false },
  { id: 'master_of_time', title: 'Master of Time', description: 'Complete 500 tracked goals', category: 'journal', icon: '\u231B', unlocked: false },

  // Mood Tracking
  { id: 'emotional_explorer', title: 'Emotional Explorer', description: 'Log 10 moods', category: 'dragon_stats', icon: '\u{1F60A}', unlocked: false },
  { id: 'mood_master', title: 'Mood Master', description: 'Log 100 moods', category: 'dragon_stats', icon: '\u{1F60E}', unlocked: false },
  { id: 'emotional_roller', title: 'Emotional Rollercoaster', description: 'Log every mood type', category: 'dragon_stats', icon: '\u{1F3A2}', unlocked: false },
  { id: 'stoic_dragon', title: 'Stoic Dragon', description: 'Log the same mood 7 days in a row', category: 'dragon_stats', icon: '\u{1F5FF}', unlocked: false },

  // Dragon Age
  { id: 'its_alive', title: "It's Alive!", description: 'Spawn your dragon', category: 'age', icon: '\u{1F389}', unlocked: false },
  { id: 'tiny_terror', title: 'Tiny Terror', description: 'Reach Hatchling', category: 'age', icon: '\u{1F423}', unlocked: false },
  { id: 'little_flame', title: 'Little Flame', description: 'Reach Dragonet', category: 'age', icon: '\u{1F525}', unlocked: false },
  { id: 'skybound_teen', title: 'Skybound Teen', description: 'Reach Juvenile', category: 'age', icon: '\u{1F324}\uFE0F', unlocked: false },
  { id: 'young_inferno', title: 'Young Inferno', description: 'Reach Young Adult', category: 'age', icon: '\u{1F525}', unlocked: false },
  { id: 'ancient_scales', title: 'Ancient Scales', description: 'Reach Elder Dragon', category: 'age', icon: '\u{1F451}', unlocked: false },
  { id: 'wyrm_ascendant', title: 'Wyrm Ascendant', description: 'Reach Wyrm', category: 'age', icon: '\u{1F409}', unlocked: false },
  { id: 'name_of_power', title: 'Name of Power', description: 'Rename a matured dragon', category: 'age', icon: '\u{1F3F7}\uFE0F', unlocked: false },

  // Scar Levels
  { id: 'marked_by_fire', title: 'Marked by Fire', description: 'Reach Scar Level 1', category: 'scar', icon: '\u{1F525}', unlocked: false },
  { id: 'battle_hardened', title: 'Battle-Hardened', description: 'Reach Scar Level 3', category: 'scar', icon: '\u2694\uFE0F', unlocked: false },
  { id: 'dragon_pact', title: 'Dragon Pact', description: 'Reach Scar Level 5', category: 'scar', icon: '\u2728', unlocked: false },
  { id: 'legend_of_scars', title: 'Legend of Scars', description: 'Reach Scar Level 10', category: 'scar', icon: '\u2B50', unlocked: false },
  { id: 'ultimate_warrior', title: 'Ultimate Dragon Warrior', description: 'Reach the final Fire XP tier', category: 'scar', icon: '\u{1F3C6}', unlocked: false },

  // Challenges
  { id: 'perfect_day', title: 'Perfect Day', description: 'Finish every planned goal and end at 0 Fury', category: 'challenges', icon: '\u2728', unlocked: false },
  { id: 'impossible_day', title: 'The Impossible Day', description: 'Finish every planned goal and end at 100 Fury', category: 'challenges', icon: '\u{1F92F}', unlocked: false },
  { id: 'fire_juggler', title: 'Fire Juggler', description: 'Maintain Fury between 40 and 60 for 7 days', category: 'challenges', icon: '\u{1F939}', unlocked: false },
  { id: 'yin_yang_master', title: 'The Yin-Yang Master', description: 'Keep Fury exactly at 50', category: 'challenges', icon: '\u262F\uFE0F', unlocked: false },

  // Secret Achievements
  { id: 'grandma_glock', title: 'Grandma Does Not Have a Glock', description: 'Open the app 100 times', category: 'secret', icon: '\u{1F52B}', unlocked: false },
  { id: 'forbidden_snack', title: 'The Forbidden Snack', description: 'Use a snack at exactly 69 Fury', category: 'secret', icon: '\u{1F346}', unlocked: false },
  { id: 'ritual', title: 'The Ritual', description: 'Do the morning survey between 4:44 and 5:55 AM', category: 'secret', icon: '\u{1F56F}\uFE0F', unlocked: false },
  { id: 'night_watcher', title: 'The Night Watcher', description: 'Do the night survey between 11:11 and 11:59 PM', category: 'secret', icon: '\u{1F319}', unlocked: false },
  { id: 'dragon_whisperer', title: 'The Dragon Whisperer', description: 'Tap the dragon 1,111 times', category: 'secret', icon: '\u{1F92B}', unlocked: false },
  { id: 'true_flame', title: 'The True Flame', description: 'Maintain your streak through a holiday', category: 'secret', icon: '\u{1F525}', unlocked: false },
  { id: 'chosen_one', title: 'The Chosen One', description: 'End the day with exactly 777 coins', category: 'secret', icon: '7\uFE0F\u20E3', unlocked: false },
  { id: 'accountant', title: 'The Accountant', description: 'End the day with 0 coins', category: 'secret', icon: '\u{1F4CA}', unlocked: false },
];

export default ACHIEVEMENTS;
