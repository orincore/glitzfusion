'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  className = '',
  autoPlay = false,
  loop = true,
  muted = true,
  controls = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error toggling video playback:', error);
      setHasError(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Handle video loading and playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setHasError(false);
    setIsPlaying(false);

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setHasError(false);
      
      if (autoPlay) {
        // Mute the video for autoplay to work in most browsers
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              // Restore muted state after autoplay starts
              if (muted !== undefined) {
                video.muted = muted;
              }
            })
            .catch(error => {
              console.warn('Auto-play was prevented:', error);
              setIsPlaying(false);
            });
        }
      }
    };

    const handleError = () => {
      console.error('Error loading video:', src);
      setIsLoading(false);
      setHasError(true);
    };

    const handleEnded = () => !loop && setIsPlaying(false);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    video.load();

    // Cleanup
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      
      // Pause and reset video on unmount
      if (!video.paused) {
        video.pause();
      }
      video.currentTime = 0;
    };
  }, [src, autoPlay, loop, muted]);

  // Show error state if video fails to load
  if (hasError) {
    console.error('Video error - Source:', src, 'Poster:', poster);
    return (
      <div className={`relative aspect-video bg-gray-900/50 flex flex-col items-center justify-center rounded-2xl ${className}`}>
        <div className="text-center p-8">
          <p className="text-gray-400 mb-4">Video could not be loaded</p>
          {poster && (
            <div className="relative w-full max-w-md h-48 mx-auto mb-4">
              <Image
                src={poster}
                alt="Video thumbnail"
                fill
                className="object-cover rounded-lg"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => console.error('Error loading poster:', e)}
              />
            </div>
          )}
          <div className="bg-black/50 p-3 rounded-lg">
            <p className="text-xs text-gray-400 break-all">Source: {src}</p>
            <p className="text-xs text-gray-500 mt-1">
              {src.startsWith('http') 
                ? 'Make sure the video URL is accessible and CORS is properly configured'
                : 'Make sure the video file exists at the specified path'}
            </p>
            <button 
              onClick={() => setHasError(false)}
              className="mt-2 text-xs bg-primary-gold/80 hover:bg-primary-gold text-black px-3 py-1 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative aspect-video overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        playsInline
        muted={isMuted}
        loop={loop}
        onClick={togglePlay}
        preload="auto"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Video element error:', e);
          setHasError(true);
        }}
      />
      
      {/* Debug info - visible in development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-1 rounded">
          {isPlaying ? '▶️ Playing' : '⏸ Paused'}
        </div>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary-gold animate-spin" />
        </div>
      )}
      
      {/* Play button overlay when paused */}
      {!isPlaying && !isLoading && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={togglePlay}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer text-white"
          >
            <PlayCircle className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      )}
      
      {isHovered && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary-gold transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <PlayCircle className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={toggleMute}
              className="text-white hover:text-primary-gold transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </motion.div>
      )}
      
      {!controls && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
