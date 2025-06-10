import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useEffect, useState } from "react";

export default function VideoGenerator({ images }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const ffmpeg = createFFmpeg({ log: true });

  useEffect(() => {
    const generateVideo = async () => {
      if (!ffmpeg.isLoaded()) await ffmpeg.load();
      images.forEach(async (img, index) => {
        ffmpeg.FS("writeFile", `image${index}.png`, await fetchFile(img));
      });

      await ffmpeg.run(
        "-framerate",
        "1",
        "-i",
        "image%d.png",
        "-c:v",
        "libx264",
        "-t",
        "5",
        "-pix_fmt",
        "yuv420p",
        "output.mp4"
      );

      const data = ffmpeg.FS("readFile", "output.mp4");
      const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
      setVideoUrl(url);
    };

    if (images.length > 0) {
      generateVideo();
    }
  }, [images]);

  return (
    <div>
      {videoUrl && (
        <video controls>
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
