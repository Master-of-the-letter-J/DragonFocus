import { AchievementsProvider } from './AchievementsProvider';
import { DragonAlarmProvider } from './DragonAlarmProvider';
import { DragonClickingProvider } from './DragonClickingProvider';
import { DragonCoinsProvider } from './DragonCoinsProvider';
import { DragonProvider } from './DragonProvider';
import { DragonShardsProvider } from './DragonShardsProvider';
import { FuryProvider } from './FuryProvider';
import { GeneratorsProvider } from './GeneratorsProvider';
import { GoalsProvider } from './GoalsProvider';
import { GraveyardProvider } from './GraveyardProvider';
import ItemsProvider from './ItemsProvider';
import { JournalProvider } from './JournalProvider';
import { PopulationProvider } from './PopulationProvider';
import { PremiumProvider } from './PremiumProvider';
import { QuestionProvider } from './QuestionProvider';
import { ScarLevelProvider } from './ScarLevelProvider';
import { StreakProvider } from './StreakProvider';
import { SurveyProvider } from './SurveyProvider';
import { ThemeProvider } from './ThemeProvider';
import { WeatherProvider } from './WeatherProvider';

export default function ParentProvider({ children }: { children: React.ReactNode }) {
	return (
		<AchievementsProvider>
			<ThemeProvider>
				<PremiumProvider>
					<FuryProvider>
						<StreakProvider>
							<DragonCoinsProvider>
								<DragonShardsProvider>
									<PopulationProvider>
										<GraveyardProvider>
											<DragonProvider>
												<WeatherProvider>
													<ScarLevelProvider>
														<DragonClickingProvider>
															<GeneratorsProvider>
																<ItemsProvider>
																	<QuestionProvider>
																		<SurveyProvider>
																			<GoalsProvider>
																				<JournalProvider>
																					<DragonAlarmProvider>{children}</DragonAlarmProvider>
																				</JournalProvider>
																			</GoalsProvider>
																		</SurveyProvider>
																	</QuestionProvider>
																</ItemsProvider>
															</GeneratorsProvider>
														</DragonClickingProvider>
													</ScarLevelProvider>
												</WeatherProvider>
											</DragonProvider>
										</GraveyardProvider>
									</PopulationProvider>
								</DragonShardsProvider>
							</DragonCoinsProvider>
						</StreakProvider>
					</FuryProvider>
				</PremiumProvider>
			</ThemeProvider>
		</AchievementsProvider>
	);
}
