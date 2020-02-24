import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import modalStyle from 'styles/modal';
import subscriptionsStyle from 'styles/subscriptions';
import Button from 'component/button';
import Colors from 'styles/colors';
import SuggestedSubscriptionsGrid from 'component/suggestedSubscriptionsGrid';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';

export default class ModalSuggestedSubcriptions extends React.PureComponent {
  render() {
    const { loadingSuggested, navigation, onDonePress, onOverlayPress } = this.props;

    return (
      <TouchableOpacity style={modalStyle.overlay} activeOpacity={1} onPress={onOverlayPress}>
        <TouchableOpacity style={[modalStyle.container, subscriptionsStyle.modalContainer]} activeOpacity={1}>
          <SuggestedSubscriptionsGrid inModal navigation={navigation} />
          <View style={modalStyle.wideButtons}>
            <Button style={modalStyle.wideDoneButton} text={__('Done')} onPress={onDonePress} />
            {loadingSuggested && (
              <ActivityIndicator size="small" color={Colors.White} style={subscriptionsStyle.modalLoading} />
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}
