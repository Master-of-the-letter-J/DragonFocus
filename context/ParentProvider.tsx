import { DragonAlarmProvider } from './DragonAlarmProvider';
import { DragonClickingProvider } from './DragonClickingProvider';
import { DragonCoinsProvider } from './DragonCoinsProvider';
import { DragonProvider } from './DragonProvider';
import { DragonShardsProvider } from './DragonShardsProvider';
import { FuryProvider } from './FuryProvider';
import { GoalsProvider } from './GoalsProvider';
import { GraveyardProvider } from './GraveyardProvider';
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
					<DragonShardsProvider>
						<GraveyardProvider>
							<DragonProvider>
								<ScarLevelProvider>
									<DragonClickingProvider>
										<ItemsProvider>
											<SurveyProvider>
												<GoalsProvider>
													<JournalProvider>
														<DragonAlarmProvider>{children}</DragonAlarmProvider>
													</JournalProvider>
												</GoalsProvider>
											</SurveyProvider>
										</ItemsProvider>
									</DragonClickingProvider>
								</ScarLevelProvider>
							</DragonProvider>
						</GraveyardProvider>
					</DragonShardsProvider>
				</DragonCoinsProvider>
			</StreakProvider>
		</FuryProvider>
	);
}
