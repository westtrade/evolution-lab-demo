import { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
	children?: ReactNode;
};

export const SafeLayout = ({ children }: Props) => {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={{
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
				flex: 1,
			}}
		>
			<View className="flex-1 items-center max-w-md mx-auto w-full p-4">
				{children}
			</View>
		</View>
	);
};
