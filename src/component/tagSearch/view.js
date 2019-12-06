import React from 'react';
import { KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MATURE_TAGS } from 'lbry-redux';
import Tag from 'component/tag';
import tagStyle from 'styles/tag';
import Colors from 'styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default class TagSearch extends React.PureComponent {
  state = {
    tag: null,
    tagResults: [],
  };

  componentDidMount() {
    const { selectedTags = [] } = this.props;
    this.updateTagResults(this.state.tag, selectedTags);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedTags: prevSelectedTags = [] } = this.props;
    const { selectedTags = [] } = nextProps;

    if (selectedTags.length !== prevSelectedTags.length) {
      this.updateTagResults(this.state.tag, selectedTags);
    }
  }

  onAddTagPress = tag => {
    const { handleAddTag } = this.props;
    if (handleAddTag) {
      handleAddTag(tag);
    }
  };

  handleTagChange = tag => {
    const { selectedTags = [] } = this.props;
    this.setState({ tag });
    this.updateTagResults(tag, selectedTags);
  };

  updateTagResults = (tag, selectedTags = []) => {
    const { unfollowedTags } = this.props;

    // the search term should always be the first result
    let results = [];
    const tagNotSelected = name => selectedTags.indexOf(name.toLowerCase()) === -1;
    const suggestedTagsSet = new Set(unfollowedTags.map(tag => tag.name));
    const suggestedTags = Array.from(suggestedTagsSet).filter(tagNotSelected);
    if (tag && tag.trim().length > 0) {
      const lcTag = tag.toLowerCase();
      if (!results.includes(lcTag)) {
        results.push(lcTag);
      }
      const doesTagMatch = name => name.toLowerCase().includes(tag.toLowerCase());
      results = results.concat(
        suggestedTags
          .filter(doesTagMatch)
          .filter(suggested => lcTag !== suggested.toLowerCase())
          .slice(0, 5)
      );
    } else {
      results = results.concat(suggestedTags.slice(0, 5));
    }

    this.setState({ tagResults: results });
  };

  render() {
    const { editable, name, style, type, selectedTags = [], showNsfwTags } = this.props;

    return (
      <View>
        <TextInput
          editable={editable}
          style={tagStyle.searchInput}
          placeholder={__('Search for more tags')}
          underlineColorAndroid={Colors.NextLbryGreen}
          value={this.state.tag}
          numberOfLines={1}
          onChangeText={this.handleTagChange}
        />
        <KeyboardAvoidingView behavior={'position'}>
          <View style={tagStyle.tagResultsList}>
            {this.state.tagResults.map(tag => (
              <Tag key={tag} name={tag} style={tagStyle.tag} type="add" onAddPress={name => this.onAddTagPress(name)} />
            ))}
          </View>
        </KeyboardAvoidingView>
        {showNsfwTags && (
          <View style={tagStyle.nsfwTagsContainer}>
            <Text style={tagStyle.nsfwTagsTitle}>{__('Mature tags')}</Text>
            <View style={tagStyle.tagResultsList}>
              {MATURE_TAGS.map(tag => (
                <Tag
                  key={tag}
                  name={tag}
                  style={tagStyle.tag}
                  type="add"
                  onAddPress={name => this.onAddTagPress(name)}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }
}
