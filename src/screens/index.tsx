// screens/index.tsx
import Home from './Home/Home';
import Splash from './Splash/Splash';
import Video from './Video/Video';

export type ScreenList = {
  Home: React.ComponentType<any>;

  Splash: React.ComponentType<any>;
  Video: React.ComponentType<any>;
};

const screens: ScreenList = {
  Home,
  Splash,
  Video,
};

export default screens;
