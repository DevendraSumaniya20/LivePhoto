import React, { ReactElement } from 'react';
import Navigation from './src/navigation/Navigation';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();
const App = (): ReactElement => {
  return <Navigation />;
};

export default App;
