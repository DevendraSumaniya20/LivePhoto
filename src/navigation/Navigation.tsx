import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import screens from '../screens';
import navigationStrings from '../constants/navigationString';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={navigationStrings.Splash}
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name={navigationStrings.Splash}
          component={screens.Splash}
        />
        <Stack.Screen name={navigationStrings.Home} component={screens.Home} />
        <Stack.Screen
          name={navigationStrings.Video}
          component={screens.Video}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
