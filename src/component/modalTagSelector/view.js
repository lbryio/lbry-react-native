import React from 'react';
import { NativeModules, Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_FOLLOWED_TAGS } from 'lbry-redux';
import Button from 'component/button';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import Tag from 'component/tag';
import TagSearch from 'component/tagSearch';
import modalTagSelectorStyle from 'styles/modalTagSelector';
import { __ } from 'utils/helper';

export default class ModalTagSelector extends React.PureComponent {
  handleAddTag = tag => {
    if (!tag) {
      return;
    }

    const { followedTags, doToast } = this.props;
    if (followedTags.map(followedTag => followedTag.name).includes(tag.toLowerCase())) {
      doToast({ message: __(`You already added the "${tag}" tag.`) });
      return;
    }

    this.props.doToggleTagFollow(tag);
    if (window.persistor) {
      window.persistor.flush();
    }
    NativeModules.Firebase.track('tag_follow', { tag });
  };

  handleRemoveTag = tag => {
    if (!tag) {
      return;
    }

    this.props.doToggleTagFollow(tag);
    if (window.persistor) {
      window.persistor.flush();
    }
    NativeModules.Firebase.track('tag_unfollow', { tag });
  };

  render() {
    const { followedTags, onOverlayPress, onDonePress } = this.props;
    const tags = followedTags ? followedTags.map(tag => tag.name) : DEFAULT_FOLLOWED_TAGS;

    return (
      <TouchableOpacity style={modalTagSelectorStyle.overlay} activeOpacity={1} onPress={onOverlayPress}>
        <View style={modalTagSelectorStyle.container}>
          <View style={modalTagSelectorStyle.titleRow}>
            <Text style={modalTagSelectorStyle.title}>Customize your tags</Text>
          </View>
          <View style={modalTagSelectorStyle.tagList}>
            {tags &&
              tags.map(tag => (
                <Tag
                  key={tag}
                  name={tag}
                  type={'remove'}
                  style={modalTagSelectorStyle.tag}
                  onRemovePress={this.handleRemoveTag}
                />
              ))}
          </View>
          <TagSearch handleAddTag={this.handleAddTag} selectedTags={tags} />
          <View style={modalTagSelectorStyle.buttons}>
            <Button style={modalTagSelectorStyle.doneButton} text={'Done'} onPress={onDonePress} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
