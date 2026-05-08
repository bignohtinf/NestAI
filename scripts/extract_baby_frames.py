import cv2
import os
import argparse

def extract_frames(video_path, output_dir, start_sec, end_sec, num_frames):
    """
    Extracts a specific number of frames from a video file between start_sec and end_sec.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}")
    
    # Open the video file
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video file at {video_path}")
        return

    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_duration = total_frames / fps
    
    print(f"Video FPS: {fps}")
    print(f"Total Frames: {total_frames}")
    print(f"Video Duration: {video_duration:.2f}s")

    # Validate range
    if start_sec < 0: start_sec = 0
    if end_sec > video_duration: end_sec = video_duration
    
    duration = end_sec - start_sec
    if duration <= 0:
        print("Error: Invalid time range.")
        cap.release()
        return

    # Calculate timestamps (evenly spaced)
    # We use num_frames-1 to include both start and end points
    interval = duration / (num_frames - 1) if num_frames > 1 else 0
    
    print(f"Extracting {num_frames} frames from {start_sec}s to {end_sec}s...")
    
    for i in range(num_frames):
        timestamp = start_sec + (i * interval)
        frame_idx = int(timestamp * fps)
        
        # Ensure we don't exceed total frames
        if frame_idx >= total_frames:
            frame_idx = total_frames - 1
            
        # Set video position
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        
        if ret:
            # Format filename with leading zeros for sorting
            output_file = os.path.join(output_dir, f"baby_week_{i+1:02d}.jpg")
            cv2.imwrite(output_file, frame)
            print(f"[{i+1}/{num_frames}] Saved: {os.path.basename(output_file)} at {timestamp:.2f}s")
        else:
            print(f"[{i+1}/{num_frames}] Failed to read frame at {timestamp:.2f}s (Index: {frame_idx})")
            
    cap.release()
    print("\nExtraction complete!")

if __name__ == "__main__":
    # Hardcoded defaults as requested
    VIDEO_PATH = r"D:\Vin\projects\A20-App-005\reference\tracker-baby.mp4"
    OUTPUT_DIR = r"D:\Vin\projects\A20-App-005\reference\baby-frames"
    START_TIME = 1.0
    END_TIME = 31.0
    COUNT = 40
    
    # Allow command line overrides if needed, but default to user's request
    parser = argparse.ArgumentParser(description="Extract frames from baby tracker video.")
    parser.add_argument("--input", default=VIDEO_PATH, help="Path to input video")
    parser.add_argument("--output", default=OUTPUT_DIR, help="Path to output directory")
    parser.add_argument("--start", type=float, default=START_TIME, help="Start time in seconds")
    parser.add_argument("--end", type=float, default=END_TIME, help="End time in seconds")
    parser.add_argument("--count", type=int, default=COUNT, help="Number of frames to extract")
    
    args = parser.parse_args()
    
    extract_frames(args.input, args.output, args.start, args.end, args.count)
