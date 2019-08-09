import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { formatTagName } from 'utils/helper';
import tagStyle from 'styles/tag';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';

export default class Tag extends React.PureComponent {
  onPressDefault = () => {
    const { name, navigation, type, onAddPress, onRemovePress } = this.props;
    if (type === 'add') {
      if (onAddPress) {
        onAddPress(name);
      }
      return;
    }
    if (type === 'remove') {
      if (onRemovePress) {
        onRemovePress(name);
      }
      return;
    }

    if (navigation) {
      // navigate to tag page
      navigation.navigate({ routeName: Constants.DRAWER_ROUTE_TAG, key: `tagPage`, params: { tag: name } });
    }
  };

  render() {
    const { name, onPress, style, type, truncate } = this.props;

    let styles = [];
    if (style) {
      if (style.length) {
        styles = styles.concat(style);
      } else {
        styles.push(style);
      }
    }

    styles.push({
      backgroundColor: Colors.TagGreen,
      borderRadius: 8,
      marginBottom: 4,
    });

    return (
      <TouchableOpacity style={styles} onPress={onPress || this.onPressDefault}>
        <View style={tagStyle.content}>
          <Text style={tagStyle.text}>{truncate ? formatTagName(name) : name}</Text>
          {type && <Icon style={tagStyle.icon} name={type === 'add' ? 'plus' : 'times'} size={8} />}
        </View>
      </TouchableOpacity>
    );
  }
}
