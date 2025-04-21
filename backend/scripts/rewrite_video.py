import imageio
import glob
import os

# Path to the directory containing videos
PATH = 'C:\\Users\\34707\\BeihangUniversity\\SciQurio\\sciqurio\\backend\\media\\videos'


def rewrite_video(input_path, output_path):
    """Rewrite a video using imageio for both reading and writing."""
    try:
        # Open the video file for reading
        reader = imageio.get_reader(input_path)
        # Get the frames per second (fps) from the metadata
        fps = reader.get_meta_data().get('fps', 30)  # Default to 30 fps if not available

        # Open the video file for writing
        writer = imageio.get_writer(output_path, fps=fps)

        # Read and write each frame
        for frame in reader:
            writer.append_data(frame)

        # Close the reader and writer
        reader.close()
        writer.close()
        print(f"Successfully rewrote video: {input_path} -> {output_path}")

    except Exception as e:
        print(f"Error processing video {input_path}: {e}")


if __name__ == "__main__":
    # Get all mp4 files in the directory
    mp4_files = glob.glob(os.path.join(PATH, '**', '*.mp4'), recursive=True)

    # Rewrite each video
    for mp4_file in mp4_files:
        try:
            # Rewrite the video in place
            rewrite_video(mp4_file, mp4_file)
        except Exception as e:
            print(f"Error rewriting video {mp4_file}: {e}")
