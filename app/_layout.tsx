import "react-native-reanimated";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { auth$ } from "@shared/store/auth";
import { View } from "react-native";
import { useProgressSteps } from "@shared/hooks";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useValue } from "@legendapp/state/react";
import { ProgressProvider } from "@shared/context";

import "./styles/global.css";

export default function RootLayout() {
	const me = useValue(auth$.me);
	const [preloaderSteps, setPreloadingSteps] = useState({
		authCompleted: false,
	});

	const [preloadFinish, setPreloadFinish] = useState(false);

	useEffect(() => {
		auth$.intialize().then(() => {
			setPreloadingSteps((steps) => ({ ...steps, authCompleted: true }));
		});
	}, []);

	const progress = useProgressSteps(preloaderSteps);

	useAnimatedReaction(
		() => (progress?.value?.value || 1) > 100,
		(isFinished) => {
			if (isFinished) {
				scheduleOnRN(setPreloadFinish, isFinished);
			}
		}
	);

	return (
		<ProgressProvider value={progress.value}>
			<SafeAreaProvider>
				<View className="bg-gray-50 h-full">
					<Stack>
						<Stack.Protected guard={!preloadFinish}>
							<Stack.Screen
								options={{ headerShown: false }}
								name="preloader"
							></Stack.Screen>
						</Stack.Protected>
						<Stack.Protected guard={preloadFinish}>
							<Stack.Protected guard={Boolean(me)}>
								<Stack.Screen
									options={{
										headerShown: false,
									}}
									name="index"
								/>
							</Stack.Protected>
							<Stack.Protected guard={!Boolean(me)}>
								<Stack.Screen
									options={{
										headerShown: false,
									}}
									name="(auth)/login"
								/>

								<Stack.Screen
									options={{
										headerShown: false,
									}}
									name="(auth)/registration"
								/>
							</Stack.Protected>
						</Stack.Protected>
					</Stack>
					<StatusBar style="auto" />
				</View>
			</SafeAreaProvider>
		</ProgressProvider>
	);
}
