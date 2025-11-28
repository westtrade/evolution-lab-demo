import { Observable, observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { supabase } from "@shared/api";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { retryyy as retry } from "retryyy";
import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";

export const session$ = observable<Session | null>(null);
syncObservable(session$, {
	persist: {
		name: "session",
		plugin: observablePersistAsyncStorage({
			AsyncStorage,
		}),
	},
});

type Auth = {
	me: null | User;
	loading: "loading" | "idle" | "error" | "loaded";
	error: AuthError | null;
	intialize(): Promise<void>;
	signInWithPassword(
		email: string,
		password: string
	): ReturnType<typeof supabase.auth.signInWithPassword>;
	isAuthenticated(): boolean;
	handleOAuth(): () => void;
};

export const auth$: Observable<Auth> = observable<Auth>({
	me: null,
	loading: "idle",
	error: null,
	async intialize() {
		const accessToken = session$.access_token?.get();
		if (!accessToken) {
			return;
		}

		auth$.loading.set("loading");

		const { data, error } = await supabase.auth.getUser(accessToken);
		auth$.error.set(error);
		if (error) {
			auth$.me.set(null);
			auth$.loading.set("error");
		}

		auth$.me.set(data.user);
	},

	async signInWithPassword(email, password) {
		auth$.loading.set("loading");
		const { data, error } = await retry(() =>
			supabase.auth.signInWithPassword({
				email,
				password,
			})
		);
		auth$.error.set(error);

		if (error) {
			auth$.me.set(null);
			auth$.loading.set("error");
		} else {
			auth$.loading.set("loaded");
		}

		session$.set(data.session);
		auth$.me.set(data.user);

		return { data, error };
	},

	isAuthenticated() {
		return Boolean(auth$.me.get());
	},

	handleOAuth() {
		const { data: listener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				session$.set(session);
				auth$.intialize();
			}
		);

		const subscription = Linking.addEventListener(
			"url",
			(event: { url: string }) => {
				console.log(event);
				WebBrowser.dismissBrowser();
			}
		);

		return () => {
			listener.subscription.unsubscribe();
			subscription.remove();
		};
	},
});
