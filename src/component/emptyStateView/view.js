import React from 'react';
import { NativeModules, Text, View, Image, TouchableOpacity } from 'react-native';
import Button from '../button';
import emptyStateStyle from 'styles/emptyState';

class EmptyStateView extends React.PureComponent {
  render() {
    const { message, buttonText, inner, onButtonPress } = this.props;

    return (
      <View
        style={[emptyStateStyle.container, inner ? emptyStateStyle.innerContainer : emptyStateStyle.outerContainer]}
      >
        <Image style={emptyStateStyle.image} resizeMode={'stretch'} source={require('../../assets/gerbil-happy.png')} />
        <Text style={emptyStateStyle.message}>{message}</Text>
        {buttonText && (
          <View style={emptyStateStyle.buttonContainer}>
            <Button style={emptyStateStyle.button} text={buttonText} onPress={onButtonPress} />
          </View>
        )}
      </View>
    );
  }
}

export default EmptyStateView;
