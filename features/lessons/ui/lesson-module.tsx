import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Database } from "@shared/api/database.types";
import { lessonsProgress$ } from "@shared/store";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { CSSAnimationKeyframes } from "react-native-reanimated";

type Props = {
	id: number;
	title: string;
	status?: Database["public"]["Enums"]["lesson_status"];
	onTap?: (id: number) => void;
};

const pulse: CSSAnimationKeyframes = {
	"0%": {
		boxShadow: "0 0 0 0 rgba(79, 70, 229, 0.4)",
	},
	"70%": {
		boxShadow: "0 0 0 10px rgba(79, 70, 229, 0)",
	},
	"100%": {
		boxShadow: "0 0 0 0 rgba(79, 70, 229, 0)",
	},
};

const ModuleLocked = ({ title }: Props) => {
	return (
		<View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-70">
			<View className="flex flex-row items-center p-4">
				<View className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
					<FontAwesome
						name="lock"
						size={16}
						className="text-gray-400 "
					/>
				</View>
				<View className="flex-1">
					<Text className="font-semibold text-gray-800">{title}</Text>
					<Text className="text-xs text-gray-500">Недоступен</Text>
				</View>
				<Text className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
					Заблокирован
				</Text>
			</View>
		</View>
	);
};

const ModuleDone = ({ title }: Props) => {
	return (
		<View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			<View className="flex flex-row items-center p-4">
				<View className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
					<FontAwesome
						name="check"
						size={16}
						className="text-green-500 "
					/>
				</View>
				<View className="flex-1">
					<Text className="font-semibold text-gray-800">{title}</Text>
					<Text className="text-xs text-gray-500">Завершено</Text>
				</View>
				<Text className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
					Готово
				</Text>
			</View>
		</View>
	);
};

const ModuleActive = ({ title }: Props) => {
	return (
		<View className="active:scale-[0.98] transition">
			<Animated.View
				style={{
					animationName: pulse,
					animationDuration: "2s",
					animationTimingFunction: "ease-in-out",
					animationIterationCount: "infinite",
					borderRadius: 16,
				}}
			>
				<View className="bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg overflow-hidden text-white">
					<View className="flex flex-row items-center p-4 cursor-pointer">
						<View className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
							<FontAwesome name="play" size={16} color="white" />
						</View>
						<View className="flex-1">
							<Text className="font-semibold  text-white">
								{title}
							</Text>
							<Text className="text-xs opacity-80  text-white">
								Доступен сейчас
							</Text>
						</View>
						<View className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
							<Text className=" text-white">Активный</Text>
						</View>
					</View>
				</View>
			</Animated.View>
		</View>
	);
};

export const Module = ({ status = "locked", ...props }: Props) => {
	const activateHandler = async () => {
		await lessonsProgress$.activateLesson(props.id);
		props.onTap?.(props.id);
	};

	if (status === "done") {
		return <ModuleDone {...props} />;
	} else if (status === "active") {
		return (
			<TouchableOpacity activeOpacity={0.9} onPress={activateHandler}>
				<ModuleActive {...props} />
			</TouchableOpacity>
		);
	}

	return <ModuleLocked {...props} />;
};
