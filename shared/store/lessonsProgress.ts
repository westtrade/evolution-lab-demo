import { observable } from "@legendapp/state";
import { supabase } from "@shared/api";
import { auth$ } from "./auth";
import { Database } from "@shared/api/database.types";
import { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";

type LessonsProgress = {
	loading: "loading" | "idle" | "error" | "loaded";
	list: Database["public"]["Functions"]["lessons_with_status"]["Returns"];
	lastCompletedLessonIdx(): number;
	error: PostgrestError | null;
	initialize(): () => void;
	sync(): Promise<void>;
	activateLesson(id: number): Promise<void>;
	progress(): number;
	finishedLessons(): number;
};

export const lessonsProgress$ = observable<LessonsProgress>({
	loading: "idle",
	error: null,
	list: [],
	lastCompletedLessonIdx(): number {
		return lessonsProgress$.list
			.get()
			.findLastIndex((lesson) => lesson.status === "done");
	},

	initialize() {
		let lessonsTableChannel: RealtimeChannel | undefined | false;

		lessonsProgress$.sync().then(() => {
			if (lessonsTableChannel === false) {
				return;
			}

			lessonsTableChannel = supabase
				.channel("lesson_progress_changes")
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "lesson_progress",
					},
					(event) => {
						const newStatus =
							event.new as Database["public"]["Tables"]["lesson_progress"]["Row"];

						const oldStatus =
							event.old as Database["public"]["Tables"]["lesson_progress"]["Row"];

						lessonsProgress$.list.set((lessons) => {
							switch (event.eventType) {
								case "INSERT": {
									return lessons.map((lesson) => ({
										...lesson,
										...(lesson.id === newStatus.lesson_id
											? {
													status: newStatus.status,
													status_id: newStatus.id,
													user_id: newStatus.user_id,
											  }
											: {}),
									}));
								}
								case "UPDATE": {
									return lessons.map((lesson) => ({
										...lesson,
										...(lesson.id === oldStatus.lesson_id
											? {
													status: null,
													status_id: null,
													user_id: null,
											  }
											: {}),
										...(lesson.id === newStatus.lesson_id
											? {
													status: newStatus.status,
													status_id: newStatus.id,
													user_id: newStatus.user_id,
											  }
											: {}),
									}));
								}
								case "DELETE": {
									return lessons.map((lesson) => ({
										...lesson,
										...(lesson.status_id === oldStatus.id
											? {
													status: null,
													status_id: null,
													user_id: null,
											  }
											: {}),
									}));
								}
							}

							return lessons;
						});
					}
				)
				.subscribe();
		});

		return () => {
			lessonsTableChannel = false;
			if (lessonsTableChannel) {
				supabase.removeChannel(lessonsTableChannel);
			}
		};
	},

	finishedLessons(): number {
		return lessonsProgress$.list
			.get()
			.filter(({ status }) => status === "done").length;
	},

	progress(): number {
		const totalLessons = lessonsProgress$.list.get().length;

		if (!totalLessons) {
			return 0;
		}

		return Math.round(
			(lessonsProgress$.finishedLessons() / totalLessons) * 100
		);
	},

	async sync() {
		lessonsProgress$.loading.set("loading");
		const { data, error } = await supabase.rpc("lessons_with_status", {
			user_uuid: auth$.me.id.get() || null,
		});

		lessonsProgress$.error.set(error);

		if (error) {
			lessonsProgress$.loading.set("error");
		} else {
			lessonsProgress$.loading.set("loaded");
			lessonsProgress$.list.set(data);
		}
	},

	async activateLesson(lessonId: number) {
		const initialList = lessonsProgress$.list.get();

		const updatedList = initialList.map((lesson) => ({
			...lesson,
			status: lesson.id === lessonId ? "done" : lesson.status,
		}));

		lessonsProgress$.list.set(updatedList);

		const { error } = await supabase.from("lesson_progress").upsert(
			{
				lesson_id: lessonId,
				user_id: auth$.me.id.get(),
				status: "done",
			},
			{ onConflict: "user_id,lesson_id" }
		);

		if (error) {
			lessonsProgress$.list.set(initialList);
		}
	},
});
