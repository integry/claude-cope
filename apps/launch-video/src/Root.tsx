import { Composition } from "remotion";
import { LaunchVideo, launchVideoDurationInFrames } from "./LaunchVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="LaunchVideo"
      component={LaunchVideo}
      durationInFrames={launchVideoDurationInFrames}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
