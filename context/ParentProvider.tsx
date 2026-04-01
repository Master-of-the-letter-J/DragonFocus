import { AchievementsProvider } from './AchievementsProvider';
import { AscensionProvider } from './AscensionProvider';
import { DragonClickingProvider } from './DragonClickingProvider';
import { DragonCoinsProvider } from './DragonCoinsProvider';
import { DragonProvider } from './DragonProvider';
import { DragonShardsProvider } from './DragonShardsProvider';
import { DragonSoulsProvider } from './DragonSoulsProvider';
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
import { DragonThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { WeatherProvider } from './WeatherProvider';

export default function ParentProvider({ children }: { children: React.ReactNode }) {
	return (
		<ToastProvider>
			<GraveyardProvider>
				<DragonProvider>
					<DragonThemeProvider>
						<PremiumProvider>
							<FuryProvider>
								<StreakProvider>
								<DragonCoinsProvider>
									<DragonShardsProvider>
										<DragonSoulsProvider>
											<PopulationProvider>
												<WeatherProvider>
													<ScarLevelProvider>
														<DragonClickingProvider>
															<GeneratorsProvider>
																<ItemsProvider>
																	<AscensionProvider>
																		<QuestionProvider>
																			<SurveyProvider>
																				<GoalsProvider>
																					<JournalProvider>
																						<AchievementsProvider>{children}</AchievementsProvider>
																					</JournalProvider>
																				</GoalsProvider>
																			</SurveyProvider>
																		</QuestionProvider>
																	</AscensionProvider>
																</ItemsProvider>
															</GeneratorsProvider>
														</DragonClickingProvider>
													</ScarLevelProvider>
												</WeatherProvider>
											</PopulationProvider>
										</DragonSoulsProvider>
									</DragonShardsProvider>
								</DragonCoinsProvider>
								</StreakProvider>
							</FuryProvider>
						</PremiumProvider>
					</DragonThemeProvider>
				</DragonProvider>
			</GraveyardProvider>
		</ToastProvider>
	);
}
