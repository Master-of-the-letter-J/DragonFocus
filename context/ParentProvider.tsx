import { DragonClickingProvider } from './DragonClickingProvider';
import { DragonCoinsProvider } from './DragonCoinsProvider';
import { DragonProvider } from './DragonProvider';
import { FuryProvider } from './FuryProvider';
import ItemsProvider from './ItemsProvider';
import { JournalProvider } from './JournalProvider';
import { ScarLevelProvider } from './ScarLevelProvider';
import { StreakProvider } from './StreakProvider';
import { SurveyProvider } from './SurveyProvider';

export default function ParentProvider({ children }: { children: React.ReactNode }) {
  return (
      <FuryProvider>
        <StreakProvider>
          <DragonCoinsProvider>
            <DragonProvider>
              <ScarLevelProvider>
                <DragonClickingProvider>
                  <ItemsProvider>
                    <SurveyProvider>
                      <JournalProvider>
                        {children}
                      </JournalProvider>
                    </SurveyProvider>
                  </ItemsProvider>
                </DragonClickingProvider>
              </ScarLevelProvider>
            </DragonProvider>
          </DragonCoinsProvider>
        </StreakProvider>
      </FuryProvider>
  );
}