import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import modalPickerStyle from 'styles/modalPicker';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';

export default class ModalPicker extends React.PureComponent {
  state = {
    selectedItem: null,
  };

  componentDidMount() {
    const { items, selectedItem } = this.props;
    if (!selectedItem && items && items.length > 0) {
      this.setState({ selectedItem: items[0] });
      return;
    }

    this.setState({ selectedItem });
  }

  componentWillReceiveProps(nextProps) {
    const { selectedItem: prevSelectedItem } = this.props;
    const { selectedItem } = nextProps;
    if (selectedItem && selectedItem.name !== prevSelectedItem.name) {
      this.setState({ selectedItem });
    }
  }

  render() {
    const { items, onItemSelected, title, onOverlayPress } = this.props;
    const { selectedItem } = this.state;

    return (
      <TouchableOpacity style={modalPickerStyle.overlay} activeOpacity={1} onPress={onOverlayPress}>
        <View style={modalPickerStyle.container}>
          <Text style={modalPickerStyle.title}>{title}</Text>
          <View style={modalPickerStyle.divider} />
          <View style={modalPickerStyle.list}>
            {items.length &&
              items.map(item => (
                <TouchableOpacity
                  key={item.name}
                  style={modalPickerStyle.listItem}
                  onPress={() => onItemSelected(item)}
                >
                  <Icon style={modalPickerStyle.itemIcon} name={item.icon} size={16} />
                  <Text style={modalPickerStyle.itemLabel}>{item.label}</Text>
                  {selectedItem && selectedItem.name === item.name && (
                    <Icon style={modalPickerStyle.itemSelected} name={'check'} color={Colors.LbryGreen} size={16} />
                  )}
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
