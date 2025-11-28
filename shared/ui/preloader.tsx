import { View, Text, ViewStyle } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ReactNode, useMemo, useState } from "react";
import Animated, {
	CSSAnimationKeyframes,
	useAnimatedReaction,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useProgress } from "@shared/context";

const fadeIn: CSSAnimationKeyframes = {
	from: {
		opacity: 0,
		transform: [{ translateY: 10 }],
	},

	to: {
		opacity: 1,
		transform: [{ translateY: 0 }],
	},
};

const STATUS_MESSAGES = [
	"Инициализация приложения...",
	"Подключение к серверу...",
	"Загрузка учебных материалов...",
	"Инициализация модулей...",
	"Настройка прогресса...",
	"Финальная проверка...",
	"Готово!",
];

const FadeInAnimation = ({
	delay,
	children,
}: {
	delay?: ViewStyle["animationDelay"];
	children?: ReactNode;
}) => {
	return (
		<Animated.View
			style={{
				animationName: fadeIn,
				animationDuration: "1s",
				animationDelay: delay,
				animationTimingFunction: "ease-out",
				animationFillMode: "forwards",
				opacity: 0,
			}}
		>
			{children}
		</Animated.View>
	);
};

export const Preloader = () => {
	const [progressValue, setProgress] = useState(0);
	const progress = useProgress();
	useAnimatedReaction(
		() => Math.round(progress?.value || 1),
		(val) => scheduleOnRN(setProgress, val < 100 ? val : 100)
	);

	const currentMessage = useMemo(() => {
		const currentStep = Math.round(
			(STATUS_MESSAGES.length - 1) * (progressValue / 100)
		);
		return STATUS_MESSAGES[currentStep];
	}, [progressValue]);

	return (
		<View className="flex  flex-col items-center my-auto">
			<View className="animate-bounce relative w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto">
				<FontAwesome name="graduation-cap" size={24} color="white" />
			</View>

			<FadeInAnimation delay="0.2s">
				<Text className="text-2xl uppercase font-black text-gray-800 mt-4">
					Learning Journey
				</Text>
			</FadeInAnimation>

			<FadeInAnimation delay="0.4s">
				<Text className="text-gray-600 text-sm fade-in">
					простые шаги к Вашему профессионализму
				</Text>
			</FadeInAnimation>

			<FadeInAnimation delay="0.8s">
				<View className="mt-8 fade-in max-w-xs w-full mx-auto">
					<View className="flex flex-row justify-between mb-2">
						<Text className="text-sm font-medium text-gray-700">
							Загрузка...
						</Text>
						<Text className="text-sm font-medium text-gray-700 ml-auto text-right">
							{progressValue}%
						</Text>
					</View>
					<View className="w-xs mx-auto bg-gray-200 rounded-full h-1 overflow-hidden">
						<View
							style={{
								width: `${progressValue}%`,
								height: "100%",
							}}
						>
							<View className="bg-linear-to-r from-blue-500 to-purple-600 min-h-full rounded-full" />
						</View>
					</View>
				</View>
			</FadeInAnimation>

			<FadeInAnimation delay="1s">
				<Text
					id="statusText"
					className="text-gray-600 text-sm mt-4 fade-in"
				>
					{currentMessage}
				</Text>
			</FadeInAnimation>
		</View>
	);
};
