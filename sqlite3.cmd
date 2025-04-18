sqlite3 db.sqlite3

-- Insert videos into the videos_video table
INSERT INTO videos_video (title, file_path, description, dataset, created_at)
VALUES ('Flow Video', 'videos/video1.mp4', 'A sample flow video.', 'Sample Dataset', datetime('now'));

INSERT INTO videos_video (title, file_path, description, dataset, created_at)
VALUES ('Flow Video', 'videos/video2.mp4', 'A sample flow video.', 'Sample Dataset', datetime('now'));

SELECT * FROM videos_video;

-- Insert the hypotheses into the AIHypothesis table and associate them with the video (id: 0)
INSERT INTO hypotheses_aihypothesis (content, video_id, difficulty, justification, created_at)
VALUES
('球体下沉速度减慢是由于液体的非牛顿流体特性，当受到外力时会增加粘度。', 0, 'Normal', 'This hypothesis is based on fluid dynamics.', datetime('now')),
('球体下沉速度减慢是由于球体表面与液体之间形成了微小气泡，增加了浮力。', 0, 'Normal', 'This hypothesis is based on buoyancy effects.', datetime('now'));

SELECT * FROM hypotheses_aihypothesis;


-- Insert random users into the users_user table
INSERT INTO users_user (
    username, email, password, is_staff, is_active, is_superuser, first_name, last_name, date_joined, labels_count
)
VALUES
('张三', 'user1@example.com', 'pbkdf2_sha256$260000$randomhash1', 0, 1, 0, 'User', 'One', datetime('now'), 128),
('李四', 'user2@example.com', 'pbkdf2_sha256$260000$randomhash2', 0, 1, 0, 'User', 'Two', datetime('now'), 112),
('王五', 'user3@example.com', 'pbkdf2_sha256$260000$randomhash3', 0, 1, 0, 'User', 'Three', datetime('now'), 97),
('赵六', 'user5@example.com', 'pbkdf2_sha256$260000$randomhash5', 0, 1, 0, 'User', 'Five', datetime('now'), 79);
('秦七', 'user4@example.com', 'pbkdf2_sha256$260000$randomhash4', 0, 1, 0, 'User', 'Four', datetime('now'), 85),

-- Verify the inserted data
SELECT * FROM users_user;

.exit