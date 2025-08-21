// screens/index.tsx
import Home from './Home/Home';
import Splash from './Splash/Splash';

export type ScreenList = {
  Home: React.ComponentType<any>;

  Splash: React.ComponentType<any>;
};

const screens: ScreenList = {
  Home,

  Splash,
};

export default screens;
