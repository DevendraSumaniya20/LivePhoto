import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import screens from '../screens';
import navigationStrings from '../constants/navigationString';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={navigationStrings.Splash}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name={navigationStrings.Splash}
          component={screens.Splash}
        />
        <Stack.Screen name={navigationStrings.Home} component={screens.Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
