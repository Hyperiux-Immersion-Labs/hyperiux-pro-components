
import VideoPlayerComp from './VideoPlayerComp'

const VideoPlayer = () => {
  return (
    <>
      <VideoPlayerComp
        videoSrc="/api/media-proxy?url=https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/showreel.mp4"
        poster="/api/media-proxy?url=https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/showreel-cover.png"
        autoPlay
        startMuted
      />
    </>
  )
}

export default VideoPlayer