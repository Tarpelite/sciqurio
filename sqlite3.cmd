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

.exit