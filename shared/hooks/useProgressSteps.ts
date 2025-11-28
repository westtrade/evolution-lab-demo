import { useEffect } from "react";
import Animated, {
	useSharedValue,
	withTiming,
	cancelAnimation,
	useAnimatedReaction,
} from "react-native-reanimated";

type UseProgressStepsOptions = {
	duration?: number;
	customPercents?: number[]; // например: [10, 40, 70, 100]
};

export function useProgressSteps(
	steps: Record<string, boolean>,
	opts: UseProgressStepsOptions = {}
) {
	const { duration = 3000, customPercents } = opts;

	const value = useSharedValue(0);

	const stepKeys = Object.keys(steps);
	const stepValues = stepKeys.map((key) => steps[key]);

	// Рассчитываем проценты
	const stepPercents =
		customPercents ??
		stepValues.map((_, i) =>
			Math.round(((i + 1) / stepValues.length) * 100)
		);

	useEffect(() => {
		const firstUnfinished = stepValues.findIndex((s) => !s);

		let targetPercent: number;

		if (firstUnfinished === -1) {
			targetPercent = 105;
		} else {
			targetPercent =
				firstUnfinished === 0 ? 0 : stepPercents[firstUnfinished - 1];
		}

		cancelAnimation(value);

		const remaining = targetPercent - value.value;
		if (remaining <= 0) {
			return;
		}

		const remainingDuration = (duration * remaining) / 100;

		value.value = withTiming(targetPercent, {
			duration: remainingDuration,
		});
	}, [JSON.stringify(steps)]);

	return { value, stepKeys };
}
