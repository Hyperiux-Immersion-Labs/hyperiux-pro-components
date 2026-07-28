// Built using Hyperiux Vault: https://vault.hyperiux.com


import VideoPlayerComp from './VideoPlayerComp'

const VideoPlayer = ({
  videoSrc = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/showreel.mp4",
  poster = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/showreel-cover.png",
  autoPlay = true,
  startMuted = true,
  showCloseButton = true,
}) => {
  return (
    <>
      <VideoPlayerComp
        videoSrc={videoSrc}
        poster={poster}
        autoPlay={autoPlay}
        startMuted={startMuted}
        showCloseButton={showCloseButton}
      />
    </>
  )
}

export default VideoPlayer