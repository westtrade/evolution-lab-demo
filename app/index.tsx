import { useValue } from "@legendapp/state/react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";

import { Module } from "@features/lessons/ui";
import { lessonsProgress$ } from "@shared/store/lessonsProgress";
import { SafeLayout } from "@shared/ui";
import Confetti from "react-native-reanimated-confetti";

export default function HomeScreen() {
	useEffect(lessonsProgress$.initialize, []);

	const [showConfetti, setConfettiVisibility] = useState(false);
	const lessons = useValue(lessonsProgress$.list);
	const lastCompletedLessonIndex = useValue(
		lessonsProgress$.lastCompletedLessonIdx
	);
	const finishedLessons = useValue(lessonsProgress$.finishedLessons);
	const progress = useValue(lessonsProgress$.progress);

	const startConfettiHandler = useCallback(
		(id: number) => {
			const lastLesson = lessons.at(-1);
			if (lastLesson && lastLesson.id === id) {
				setConfettiVisibility(true);
			}
		},
		[lessons]
	);

	return (
		<SafeLayout>
			{showConfetti && <Confetti />}

			<View className="mb-6 w-full gap-2">
				<Text className="text-3xl font-bold text-gray-800">
					Обучение
				</Text>
				<Text className="text-gray-600 text-sm">
					Пройдите все модули для завершения курса
				</Text>
			</View>

			<View className="gap-3 h-full grow w-full basis-0 min-w-0 mb-8">
				{lessons.map((lesson, idx) => {
					const status =
						lesson.status ||
						(lastCompletedLessonIndex === idx
							? "done"
							: idx === lastCompletedLessonIndex + 1
							? "active"
							: "locked");

					return (
						<Module
							title={lesson.title}
							status={status}
							key={lesson.id}
							id={lesson.id}
							onTap={startConfettiHandler}
						/>
					);
				})}
			</View>

			<View className="bg-white rounded-2xl p-4 shadow-sm w-full mt-auto">
				<View className="flex flex-row justify-between mb-2">
					<Text className="text-sm font-medium text-gray-700">
						Прогресс курса
					</Text>
					<Text className="text-sm font-medium text-gray-700">
						{progress}%
					</Text>
				</View>
				<View className="w-full bg-gray-200 rounded-full h-2.5">
					<View style={{ width: `${progress}%` }}>
						<View className="bg-indigo-600 h-2.5 rounded-full w-full" />
					</View>
				</View>
				<Text className="text-xs text-gray-500 mt-2">
					{finishedLessons} из {lessons.length} модулей завершено
				</Text>
			</View>
		</SafeLayout>
	);
}
