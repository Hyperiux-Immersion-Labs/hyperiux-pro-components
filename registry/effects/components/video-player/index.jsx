
import VideoPlayerComp from './VideoPlayerComp'

const VideoPlayer = () => {
  return (
    <>
      <VideoPlayerComp
        videoSrc="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        autoPlay
        startMuted
      />
    </>
  )
}

export default VideoPlayer