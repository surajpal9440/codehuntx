import { useState, useRef, useEffect } from 'react';
import { Pause, Play } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [duration, setDuration] = useState(0);

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = async (e) => {
    if (e) e.stopPropagation(); // Stop event bubbling
    
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise; // Wait for browser to be ready
          setIsPlaying(true);
        }
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("Playback error:", err);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state when URL changes
    setIsPlaying(false);
    setCurrentTime(0);

    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(video.duration || 0);

    // If metadata is already there, set it immediately
    if (video.readyState >= 1) {
      setDuration(video.duration);
    }

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Force video to load the new source
    video.load();

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [secureUrl]); // 🚀 Crucial: Re-run when secureUrl changes

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg bg-black"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="w-full aspect-video cursor-pointer"
        preload="metadata"
        playsInline
      />
      
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            className="btn btn-circle btn-primary btn-sm"
          >
            {isPlaying ? <Pause size={18}/> : <Play size={18}/>}
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-white text-xs font-mono">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                const time = Number(e.target.value);
                setCurrentTime(time);
                if (videoRef.current) videoRef.current.currentTime = time;
              }}
              className="range range-primary range-xs flex-1"
            />
            <span className="text-white text-xs font-mono">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editorial;