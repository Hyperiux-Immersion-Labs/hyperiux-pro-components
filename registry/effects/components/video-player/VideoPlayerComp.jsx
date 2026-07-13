"use client";

import  {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

const formatTime = (time) => {
  if (!Number.isFinite(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const readVideoDuration = (video) => {
  const duration = video?.duration;

  if (!Number.isFinite(duration) || duration <= 0) return 0;

  return duration;
};

const VideoPlayerComp = ({
  videoSrc = "",
  poster = "",
  autoPlay = true,
  startMuted = true,
  isActive = true,
  className = "",
  rounded = false,
  preserveAspectRatio = true,
  onRequestClose,
  showCloseButton = true,
  resetOnClose = true,
  hideControlsDelay = 1800,
}) => {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const progressRafRef = useRef(null);
  const isDraggingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const [isMuted, setIsMuted] = useState(startMuted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const progress = useMemo(() => {
    const safeDuration =
      Number.isFinite(duration) && duration > 0 ? duration : 0;

    const safeCurrentTime =
      Number.isFinite(currentTime) && currentTime > 0 ? currentTime : 0;

    if (!safeDuration) return 0;

    return Math.min(
      100,
      Math.max(0, (safeCurrentTime / safeDuration) * 100)
    );
  }, [currentTime, duration]);

  const clearHideTimer = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  }, []);

  const stopProgressLoop = useCallback(() => {
    if (progressRafRef.current) {
      cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }
  }, []);

  const syncVideoProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const nextDuration = readVideoDuration(video);
    const nextCurrentTime = Number.isFinite(video.currentTime)
      ? video.currentTime
      : 0;

    setDuration(nextDuration);
    setCurrentTime(Math.min(nextCurrentTime, nextDuration || nextCurrentTime));
  }, []);

  const startProgressLoop = useCallback(() => {
    stopProgressLoop();

    const tick = () => {
      const video = videoRef.current;

      if (!video) {
        stopProgressLoop();
        return;
      }

      if (!isDraggingRef.current) {
        syncVideoProgress();
      }

      if (!video.paused && !video.ended) {
        progressRafRef.current = requestAnimationFrame(tick);
      } else {
        stopProgressLoop();
      }
    };

    progressRafRef.current = requestAnimationFrame(tick);
  }, [stopProgressLoop, syncVideoProgress]);

  const startHideTimer = useCallback(() => {
    clearHideTimer();

    hideControlsTimeoutRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        setShowControls(false);
      }
    }, hideControlsDelay);
  }, [clearHideTimer, hideControlsDelay]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    startHideTimer();
  }, [startHideTimer]);

  const syncMutedState = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
  }, [isMuted]);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return false;

    try {
      await video.play();
      setIsPlaying(true);
      syncVideoProgress();
      startProgressLoop();
      return true;
    } catch {
      setIsPlaying(false);
      stopProgressLoop();
      return false;
    }
  }, [syncVideoProgress, startProgressLoop, stopProgressLoop]);

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);
    syncVideoProgress();
    stopProgressLoop();
  }, [syncVideoProgress, stopProgressLoop]);

  const resetVideoState = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    pauseVideo();

    if (resetOnClose) {
      video.currentTime = 0;
      setCurrentTime(0);
    }

    setDuration(readVideoDuration(video));
    setIsMuted(startMuted);
    video.muted = startMuted;
    setShowControls(true);
    clearHideTimer();
  }, [pauseVideo, resetOnClose, startMuted, clearHideTimer]);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        setIsFullscreen(false);
      }
    } else {
      setIsFullscreen(false);
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    setIsFullscreen(true);
    revealControls();

    if (wrapper.requestFullscreen) {
      try {
        await wrapper.requestFullscreen();
      } catch {
        setIsFullscreen(true);
      }
    }
  }, [revealControls]);

  const handleToggleFullscreen = useCallback(
    async (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();

      if (isFullscreen || document.fullscreenElement) {
        await exitFullscreen();
      } else {
        await enterFullscreen();
      }

      revealControls();
      requestAnimationFrame(syncVideoProgress);
    },
    [
      isFullscreen,
      enterFullscreen,
      exitFullscreen,
      revealControls,
      syncVideoProgress,
    ]
  );

  const handleClose = async () => {
    if (isFullscreen || document.fullscreenElement) {
      await exitFullscreen();
    }

    resetVideoState();
    onRequestClose?.();
  };

  const updateVideoTimeFromClientX = useCallback((clientX) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;

    if (!video || !progressBar) return;

    const safeDuration = readVideoDuration(video);

    if (!safeDuration) return;

    const rect = progressBar.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const percentage = rect.width ? x / rect.width : 0;
    const nextTime = Math.min(
      Math.max(percentage * safeDuration, 0),
      safeDuration
    );

    video.currentTime = nextTime;
    setDuration(safeDuration);
    setCurrentTime(nextTime);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      revealControls();
      requestAnimationFrame(syncVideoProgress);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [revealControls, syncVideoProgress]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      syncVideoProgress();
    };

    const handleDurationChange = () => {
      syncVideoProgress();
    };

    const handleTimeUpdate = () => {
      if (!isDraggingRef.current) {
        syncVideoProgress();
      }
    };

    const handleSeeking = () => {
      syncVideoProgress();
    };

    const handleSeeked = () => {
      syncVideoProgress();

      if (!video.paused && !video.ended) {
        startProgressLoop();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      syncVideoProgress();
      startProgressLoop();
    };

    const handlePause = () => {
      setIsPlaying(false);
      syncVideoProgress();
      stopProgressLoop();
    };

    const handleEnded = () => {
      const safeDuration = readVideoDuration(video);

      setIsPlaying(false);
      setDuration(safeDuration);
      setCurrentTime(safeDuration || video.currentTime || 0);
      setShowControls(true);
      clearHideTimer();
      stopProgressLoop();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    syncVideoProgress();

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [
    clearHideTimer,
    syncVideoProgress,
    startProgressLoop,
    stopProgressLoop,
  ]);

  useEffect(() => {
    syncMutedState();
  }, [isMuted, syncMutedState]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    stopProgressLoop();

    if (hasInitializedRef.current) {
      pauseVideo();

      if (resetOnClose) {
        video.currentTime = 0;

        requestAnimationFrame(() => {
          setCurrentTime(0);
          setDuration(readVideoDuration(video));
        });
      }

      requestAnimationFrame(() => {
        setIsMuted(startMuted);
        setShowControls(true);
        syncVideoProgress();
      });

      video.muted = startMuted;
    } else {
      hasInitializedRef.current = true;
    }

    requestAnimationFrame(() => {
      revealControls();
      syncVideoProgress();
    });

    return () => {
      clearHideTimer();
      stopProgressLoop();
      video.pause();
    };
  }, [
    videoSrc,
    poster,
    resetOnClose,
    startMuted,
    pauseVideo,
    revealControls,
    clearHideTimer,
    syncVideoProgress,
    stopProgressLoop,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isActive) {
      pauseVideo();

      if (resetOnClose) {
        video.currentTime = 0;

        requestAnimationFrame(() => {
          setCurrentTime(0);
          setDuration(readVideoDuration(video));
        });
      }

      clearHideTimer();
      stopProgressLoop();
      return;
    }

    requestAnimationFrame(() => {
      revealControls();
      syncVideoProgress();
    });

    if (autoPlay) {
      requestAnimationFrame(() => {
        playVideo();
      });
    }
  }, [
    isActive,
    autoPlay,
    resetOnClose,
    pauseVideo,
    playVideo,
    revealControls,
    clearHideTimer,
    syncVideoProgress,
    stopProgressLoop,
  ]);

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      clearHideTimer();
      stopProgressLoop();

      if (video) video.pause();

      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch?.(() => {});
      }
    };
  }, [clearHideTimer, stopProgressLoop]);

  const handleTogglePlay = async (event) => {
    event?.stopPropagation?.();

    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await playVideo();
    } else {
      pauseVideo();
    }

    revealControls();
  };

  const handleToggleMute = (event) => {
    event?.stopPropagation?.();

    setIsMuted((prev) => !prev);
    revealControls();
  };

  const handleProgressClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    updateVideoTimeFromClientX(event.clientX);
    revealControls();

    const video = videoRef.current;

    if (video && !video.paused && !video.ended) {
      startProgressLoop();
    }
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    isDraggingRef.current = true;
    stopProgressLoop();
    updateVideoTimeFromClientX(event.clientX);
    revealControls();

    const handlePointerMove = (moveEvent) => {
      updateVideoTimeFromClientX(moveEvent.clientX);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      syncVideoProgress();

      const video = videoRef.current;

      if (video && !video.paused && !video.ended) {
        startProgressLoop();
      }

      startHideTimer();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleMouseMove = () => {
    revealControls();
  };

  const handleMouseLeave = () => {
    if (isFullscreen) return;

    clearHideTimer();
    setShowControls(false);
  };

  const visibilityClasses = showControls
    ? "opacity-100 pointer-events-auto"
    : "pointer-events-none opacity-0";

  return (
    <div
      ref={wrapperRef}
      className={`${
        isFullscreen
          ? "fixed inset-0 z-9999 flex h-screen w-screen items-center justify-center bg-black"
          : `h-full w-full ${className}`
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={revealControls}
      onTouchStart={revealControls}
    >
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-black ${
          rounded && !isFullscreen ? "rounded-[2vw]" : ""
        }`}
      >
        <video
          ref={videoRef}
          className={`block h-full w-full bg-black ${
            preserveAspectRatio ? "object-contain" : "object-cover"
          }`}
          src={videoSrc}
          poster={poster}
          playsInline
          preload="metadata"
          muted={isMuted}
        />

        <button
          type="button"
          className={`absolute left-1/2 top-1/2 z-3 flex min-h-15 min-w-15 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 text-white backdrop-blur-sm transition-[opacity,transform] duration-300 ease-in-out h-[5.5vw] w-[5.5vw] 2xl:h-[4.5vw] 2xl:w-[4.5vw] max-xl:h-[8vw] max-xl:w-[8vw] max-md:h-[16vw] max-md:w-[16vw] ${visibilityClasses}`}
          onClick={handleTogglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>

        {showCloseButton && typeof onRequestClose === "function" && (
          <button
            type="button"
            className={`absolute right-[1.8vw] top-[1.8vw] z-5 flex min-h-10.5 min-w-10.5 cursor-pointer items-center justify-center rounded-full border-none bg-black/45 text-white backdrop-blur-sm transition-[opacity,transform,background-color] duration-300 ease-in-out hover:scale-[1.04] hover:bg-black/65 h-[3.8vw] w-[3.8vw] 2xl:right-[1.5vw] 2xl:top-[1.5vw] 2xl:h-[3vw] 2xl:w-[3vw] max-xl:right-[2.4vw] max-xl:top-[2.4vw] max-xl:h-[5.5vw] max-xl:w-[5.5vw] max-md:right-4 max-md:top-4 max-md:h-[11vw] max-md:w-[11vw] touch-manipulation ${visibilityClasses}`}
            onClick={(event) => {
              event.stopPropagation();
              handleClose();
            }}
            aria-label="Close video"
          >
            <X size={20} className="pointer-events-none" />
          </button>
        )}

        <div
          className={`absolute bottom-[1.5vw] left-[1.5vw] right-[1.5vw] z-4 grid grid-cols-[auto_auto_1fr_auto_auto_auto] items-center gap-[1.1vw] rounded-full bg-black/50 px-[1.2vw] py-[1vw] backdrop-blur-[10px] transition-[opacity,transform] duration-300 ease-in-out 2xl:bottom-[1.2vw] 2xl:left-[1.2vw] 2xl:right-[1.2vw] 2xl:gap-[0.9vw] 2xl:px-[1vw] 2xl:py-[0.9vw] max-xl:bottom-[2vw] max-xl:left-[2vw] max-xl:right-[2vw] max-xl:gap-[1.6vw] max-xl:px-[1.8vw] max-xl:py-[1.6vw] max-md:bottom-[3vw] max-md:left-[3vw] max-md:right-[3vw] max-md:gap-[2vw] max-md:px-[3vw] max-md:py-[2.6vw] ${visibilityClasses}`}
        >
          <button
            type="button"
            className="flex h-[3vw] w-[3vw] min-h-9.5 min-w-9.5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-white 2xl:h-[2.5vw] 2xl:w-[2.5vw] max-xl:h-[4.5vw] max-xl:w-[4.5vw] max-md:h-[9vw] max-md:w-[9vw]"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <div className="whitespace-nowrap text-[1.1vw] leading-none text-white 2xl:text-[0.95vw] max-xl:text-[1.8vw] max-md:text-[3vw]">
            <span>{formatTime(currentTime)}</span>
          </div>

          <div
            ref={progressBarRef}
            className="relative flex h-[1.4vw] w-full cursor-pointer items-center min-h-4.5 2xl:h-[1.2vw] max-xl:h-[2vw] max-md:h-[4vw]"
            onClick={handleProgressClick}
            onPointerDown={handlePointerDown}
          >
            <div className="pointer-events-none absolute inset-x-0 h-[0.32vw] rounded-full bg-white/20 min-h-1 2xl:h-[0.25vw] max-xl:h-[0.45vw] max-md:h-[1vw]" />

            <div
              className="pointer-events-none absolute left-0 h-[0.32vw] rounded-full bg-white min-h-1 2xl:h-[0.25vw] max-xl:h-[0.45vw] max-md:h-[1vw]"
              style={{ width: `${progress}%` }}
            />

            <div
              className="pointer-events-none absolute top-1/2 h-[1vw] w-[1vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white min-h-3.5 min-w-3.5 2xl:h-[0.9vw] 2xl:w-[0.9vw] max-xl:h-[1.6vw] max-xl:w-[1.6vw] max-md:h-[3vw] max-md:w-[3vw]"
              style={{ left: `${progress}%` }}
            />
          </div>

          <div className="whitespace-nowrap text-[1.1vw] leading-none text-white 2xl:text-[0.95vw] max-xl:text-[1.8vw] max-md:text-[3vw]">
            <span>{formatTime(duration)}</span>
          </div>

          <button
            type="button"
            className="flex h-[3vw] w-[3vw] min-h-9.5 min-w-9.5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-white 2xl:h-[2.5vw] 2xl:w-[2.5vw] max-xl:h-[4.5vw] max-xl:w-[4.5vw] max-md:h-[9vw] max-md:w-[9vw]"
            onClick={handleToggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            type="button"
            className="flex h-[3vw] w-[3vw] min-h-9.5 min-w-9.5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-white 2xl:h-[2.5vw] 2xl:w-[2.5vw] max-xl:h-[4.5vw] max-xl:w-[4.5vw] max-md:h-[9vw] max-md:w-[9vw]"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerComp;