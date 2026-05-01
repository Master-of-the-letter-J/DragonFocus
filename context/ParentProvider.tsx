import { AchievementsProvider } from './AchievementsProvider';
import { AscensionProvider } from './AscensionProvider';
import { DragonClickingProvider } from './DragonClickingProvider';
import { DragonCoinsProvider } from './DragonCoinsProvider';
import { DragonEmbersProvider } from './DragonEmbersProvider';
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
import { TranscensionProvider } from './TranscensionProvider';
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
											<DragonEmbersProvider>
												<PopulationProvider>
													<WeatherProvider>
														<ScarLevelProvider>
															<DragonClickingProvider>
																<GeneratorsProvider>
																	{/* @requires DragonCoinsProvider @requires DragonShardsProvider @requires DragonSoulsProvider */}
																	<ItemsProvider>
																		{/* @requires DragonProvider @requires ScarLevelProvider @requires PopulationProvider @requires ItemsProvider */}
																		<TranscensionProvider>
																			{/* @requires DragonProvider @requires DragonCoinsProvider @requires DragonShardsProvider @requires DragonSoulsProvider @requires ItemsProvider @requires TranscensionProvider */}
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
																		</TranscensionProvider>
																	</ItemsProvider>
																</GeneratorsProvider>
															</DragonClickingProvider>
														</ScarLevelProvider>
													</WeatherProvider>
												</PopulationProvider>
											</DragonEmbersProvider>
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
