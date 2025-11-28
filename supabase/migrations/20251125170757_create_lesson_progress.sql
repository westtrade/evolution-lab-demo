CREATE TYPE lesson_status AS ENUM ('done', 'active', 'locked');

CREATE TABLE lesson_progress (
    id         SERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id  INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status     lesson_status NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;

CREATE UNIQUE INDEX lesson_progress_user_lesson_idx
  ON lesson_progress (user_id, lesson_id);

CREATE OR REPLACE FUNCTION lessons_with_status(user_uuid UUID)
	RETURNS TABLE (
		id INT,
		title TEXT,
		order_index INT,
		slug TEXT,
		status lesson_status,
		user_id UUID,
		status_id INT
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT DISTINCT ON (l.id)
			l.id,
			l.title,
			l.order_index,
			l.slug,
			lp.status,
			lp.user_id,
			lp.id
		FROM lessons l
		LEFT JOIN lesson_progress lp 
			ON lp.lesson_id = l.id
			AND (lp.user_id = user_uuid OR lp.user_id IS NULL)
		ORDER BY l.id,
				CASE WHEN lp.user_id = user_uuid THEN 0 ELSE 1 END;
	END;
	$$ LANGUAGE plpgsql;
