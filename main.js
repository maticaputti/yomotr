import Exponent, { Notifications } from 'exponent';
import React from 'react';
import { Platform, StatusBar, StyleSheet,
         View, Alert, Vibration } from 'react-native';
import { NavigationContext, NavigationProvider } from '@exponent/ex-navigation';
import { Provider as ReduxProvider } from 'react-redux';
import store from './state/store';
import Router from './navigation/Router';
import cacheAssetsAsync from './utils/cacheAssetsAsync';
import App from './components/App';

class AppContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = { appIsReady: false };
  }

  componentWillMount() {
    this.loadAssetsAsync();
    this.notificationSubscription = Notifications.addListener(this.handleNotification);
  }

  handleNotification(notification) {
    const message = notification.data.response;

    if (message) {
      Alert.alert(message, 'this is a push notification');
      Vibration.vibrate();
    }
  }

  async loadAssetsAsync() {
    try {
      await cacheAssetsAsync({
        images: [
          require('./assets/images/logo-transparent.png'),
          require('./assets/images/home-bg.png')
        ],
        fonts: [
          { montserrat: require('./assets/fonts/Montserrat-Bold.ttf') }
        ]
      });
    } catch (e) {
      console.warn('There was an error caching assets (see: main.js), perhaps due to a network timeout, so we skipped caching. Reload the app to try again.');
    } finally {
      this.setState({ appIsReady: true });
    }
  }

  render() {
    if (this.state.appIsReady) {
      const navigationContext = new NavigationContext({
        router: Router
        // store
      });

      return (
        <ReduxProvider store={store}>
          <View style={styles.container}>
            <NavigationProvider context={navigationContext}>
              <App />
            </NavigationProvider>

            {Platform.OS === 'ios' && <StatusBar barStyle="light-content" hidden />}
            {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
          </View>
        </ReduxProvider>
      );
    }

    return <Exponent.Components.AppLoading />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)'
  }
});

Exponent.registerRootComponent(AppContainer);
