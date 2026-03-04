# Session 2 Changes Summary

## ✅ Completed

### 1. Trivia Added to Morning Survey

- Imported `TRIVIA` from constants
- Added dynamic trivia sections based on `questionSettings.trivia.morningCount`
- Implemented trivia randomization with answer shuffling
- Added trivia saving/loading to survey progress
- Trivia sections render between journal and quote
- Multiple choice UI with submit/feedback implemented

### 2. Progress Bar Save Fixed

- `progressPercent` is already being saved to survey progress
- Home page correctly reads and displays progress from saved state
- Both morning and night surveys save progress on exit

### 3. Settings Updated

- **Fury Buttons**: Changed custom mood fury input to buttons (-10, -5, -2, +2, +5, +10)
- **XP Buttons**: Added +1K, +10K, +100K XP cheats buttons in general settings
- **Fury Cheats**: Reorganized fury buttons to match new button set

### 4. Suggested To-Dos Already in Morning

- Confirmed `suggestedTodoGoals` already appear in morning survey footer
- User can add from suggestions and re-roll

---

## 🔄 In Progress / Needs Work

### Habit Challenge Goals UI Rework

Currently using dropdown/number inputs. Should change to:

- Three buttons: "7 Days", "14 Days", "30 Days"
- Then an "Enable" button to activate
- Once enabled, cannot edit until streak broken or challenge completed

**Files affected:**

- [app/(tabs)/pages/pages/journal.tsx](<app/(tabs)/pages/journal.tsx>) - journal view where habit editor opens
- [components/goalEditor.tsx](components/goalEditor.tsx) - HabitEditor component needs new challenge UI

**Cost/Reward Details** (already in code comments):

- 7d: 10 coins, +100 coins reward, +10 shards reward
- 14d: 25 coins, +250 coins reward, +25 shards reward
- 30d: 50 coins + 5 shards, +750 coins reward, +60 shards reward

### Next Button Validation

Add checks before allowing "Next":

- Trivia sections: only allow next if `answers[trivia${i}Submitted]` is true
- Prompt sections: only if prompt text has at least 1 character
- Journal sections: only if journal text has at least 1 character

**Implementation location**: [app/(survey)/surveyMorning.tsx](<app/(survey)/surveyMorning.tsx#L200>) - modify `goNext()` function

### Max Goals Quota System

Need to implement goal limits:

- Habits: 10 + (5 at Scar 4, 5 at Scar 8, 5 at Scar 10) = up to 25
- Todos: 5 + (5 at Scar 4, 5 at Scar 8, 5 at Scar 10) = up to 20
- Premium: Unlimited for both
- UI: Disable "+ Add Habit/Todo" button when limit reached
- Message: "Max Goal Quotas Reached. Unlock More with Higher Scar Level or Premium."

**Files affected:**

- [context/GoalsProvider.tsx](context/GoalsProvider.tsx) - `canAddHabit()`, `canAddTodo()` methods
- [app/(survey)/surveyMorning.tsx](<app/(survey)/surveyMorning.tsx>) - disable "Add" buttons when quota reached

### Drag & Drop Issues

Current implementation uses `react-native-draggable-flatlist`. Issues:

- Views expand too much on interaction
- Drag doesn't work smoothly

**Solution**: Reduce `ScaleDecorator` scale effect or check for prop configuration issues

**Files affected:**

- [app/(survey)/surveyMorning.tsx](<app/(survey)/surveyMorning.tsx#L275>) - renderHabitItem, renderTodoItem

### XP Bug

User reports starting XP is -250. Check:

- [context/ScarLevelProvider.tsx](context/ScarLevelProvider.tsx) - initial XP value
- Verify XP calculation in coin calculations

---

## ⏳ Not Started

### 1. Survey Animation Modal

- Show full-screen modal at survey start with "\_\_ Survey" text
- Display for 1 second with animation
- Background animation (future: from Figma design)

**Implementation location**: [app/(survey)/surveyMorning.tsx](<app/(survey)/surveyMorning.tsx>) & [app/(survey)/surveyNight.tsx](<app/(survey)/surveyNight.tsx>)

### 2. Dragon Clickability Fix

- Ensure dragon on home page is clickable for coins
- Check [app/(tabs)/pages/home.tsx](<app/(tabs)/pages/home.tsx#L119>) dragon image Pressable

### 3. Suggested Challenge To-Do Goals

- Currently suggested todos don't have extra rewards
- Need to mark certain suggested todos as "challenge" todos
- These give bonus coins/shards when completed by due date
- Add to [constants/suggestgoals.tsx](constants/suggestgoals.tsx)

### 4. Morning Survey Sections

- Verify all section transitions work correctly with dynamic trivia insertion
- May need to adjust "previous" navigation for trivia sections

---

## 📝 Notes for Next Session

1. **Type Fixes Applied**: Fixed TypeScript issue with trivia filter mapping
2. **Testing Needed**:

   - Trivia saves/loads correctly
   - Progress bar updates on exit from surveys
   - Fury buttons work with custom moods
   - XP buttons award correctly

3. **Slider Package**: Still needs `npx expo install @react-native-community/slider` locally

4. **Missing Assets**: `app.json` still references missing icon/splash image files

---

## Files Modified This Session

- [app/(survey)/surveyMorning.tsx](<app/(survey)/surveyMorning.tsx>) - Added trivia
- [app/(settings)/generalSettings.tsx](<app/(settings)/generalSettings.tsx>) - Added fury and XP buttons
- [app/(settings)/surveySettings.tsx](<app/(settings)/surveySettings.tsx>) - Changed fury input to buttons
