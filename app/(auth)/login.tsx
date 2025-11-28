import { SafeLayout } from "@shared/ui";
import { Link } from "expo-router";
import { Linking, Text, TextInput, TouchableOpacity, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import { auth$ } from "@shared/store";
import { AuthError } from "@supabase/supabase-js";
import clsx from "clsx";
import { supabase } from "@shared/api";
import * as WebBrowser from "expo-web-browser";

export const LoginPage = () => {
	const [form, setForm] = useState<{
		email: string;
		password: string;
		error: AuthError | null;
		loading: boolean;
	}>({
		email: "demo@demo.demo",
		password: "demo",
		error: null,
		loading: false,
	});

	const submit = async () => {
		setForm((f) => ({ ...f, loading: true }));

		const { error } = await auth$.signInWithPassword(
			form.email,
			form.password
		);

		if (error) {
			setForm((f) => ({ ...f, error }));
		}

		setForm((f) => ({ ...f, loading: false }));
	};

	useEffect(() => auth$.handleOAuth(), []);

	const signInWithGithub = async () => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "github",
			options: {
				redirectTo: "evolutionlabdemo://callback",
			},
		});

		if (error) {
			setForm((f) => ({ ...f, error }));
			return;
		}

		// if (data?.url) {
		// 	await WebBrowser.openBrowserAsync(data.url);
		// }
	};

	return (
		<SafeLayout>
			<View className=" mx-auto flex-1 w-full px-4">
				<View className="my-auto">
					<View className="mb-6 w-full gap-2  items-center">
						<Text className="text-3xl font-bold text-gray-800">
							Добро пожаловать
						</Text>
						<Text className="text-gray-600 text-sm">
							Войдите в свой аккаунт
						</Text>
					</View>

					{form.error && (
						<View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
							<View className="flex items-start flex-row">
								<FontAwesome
									name="exclamation-circle"
									size={18}
									color="#fb2c36"
									className=" mt-0.5 mr-3"
								/>
								<View className="shrink">
									<Text className="text-sm font-medium text-red-800">
										Неверные учетные данные
									</Text>
									<Text className="text-sm text-red-700 mt-1 text-wrap">
										Email или пароль введены неверно.
										Пожалуйста, проверьте данные и
										попробуйте снова.
									</Text>
								</View>
							</View>
						</View>
					)}

					<View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
						<View>
							<View className="mb-5">
								<Text className="block text-sm font-medium text-gray-700 mb-2">
									Email
								</Text>
								<TextInput
									keyboardType="email-address"
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-field"
									placeholder="your@email.com"
									value={form.email}
									onChangeText={(email) =>
										setForm((f) => ({ ...form, email }))
									}
								/>
							</View>

							<View className="mb-6">
								<Text className="block text-sm font-medium text-gray-700 mb-2">
									Пароль
								</Text>
								<TextInput
									secureTextEntry
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-field"
									placeholder="••••••••"
									value={form.password}
									onChangeText={(password) =>
										setForm((f) => ({ ...form, password }))
									}
								/>
							</View>

							<TouchableOpacity
								disabled={form.loading}
								onPress={submit}
								className={clsx(
									"w-full h-12 flex-row items-center justify-center gap-4 bg-indigo-600 text-white py-3.5 rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-6",
									{
										"opacity-50": form.loading,
									}
								)}
							>
								{form.loading ? (
									<FontAwesome
										name="spinner"
										size={18}
										color="white"
										className=" mt-0.5 mr-3 animate-spin"
									/>
								) : (
									<Text className="text-center text-white font-medium">
										Войти
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>

					<View className="flex-row mb-6 items-center w-full">
						<View className=" inset-0 flex items-center grow">
							<View className="w-full border-t border-gray-300" />
						</View>
						<View className=" flex justify-center text-sm">
							<Text className="px-3  text-gray-500">
								или продолжить с
							</Text>
						</View>

						<View className=" inset-0 flex items-center  grow">
							<View className="w-full border-t border-gray-300" />
						</View>
					</View>

					<View className="flex flex-row justify-center gap-4 mb-8">
						<TouchableOpacity
							className="social-btn shrink flex items-center justify-center w-full h-12 rounded-xl bg-gray-800 text-white shadow-sm hover:bg-gray-700"
							onPress={signInWithGithub}
						>
							<FontAwesome
								name="github"
								size={18}
								color="white"
							/>
						</TouchableOpacity>
					</View>

					<View className="flex-row items-center text-center text-sm text-gray-600 mb-8 w-full justify-center">
						<Text>Нет аккаунта? </Text>
						<Link href="/registration">
							<Text className="font-medium text-indigo-600 hover:text-indigo-500">
								Создать аккаунт
							</Text>
						</Link>
					</View>
				</View>
			</View>
		</SafeLayout>
	);
};

export default LoginPage;
