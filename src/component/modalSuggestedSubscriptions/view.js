import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import modalStyle from 'styles/modal';
import subscriptionsStyle from 'styles/subscriptions';
import Button from 'component/button';
import Colors from 'styles/colors';
import SuggestedSubscriptionsGrid from 'component/suggestedSubscriptionsGrid';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';

export default class ModalSuggestedSubcriptions extends React.PureComponent {
  render() {
    const { navigation, onDonePress, onOverlayPress } = this.props;

    return (
      <TouchableOpacity style={modalStyle.overlay} activeOpacity={1} onPress={onOverlayPress}>
        <TouchableOpacity style={[modalStyle.container, subscriptionsStyle.modalContainer]} activeOpacity={1}>
          <SuggestedSubscriptionsGrid inModal navigation={navigation} />
          <View style={modalStyle.buttons}>
            <Button style={modalStyle.doneButton} text={__('Done')} onPress={onDonePress} />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}
