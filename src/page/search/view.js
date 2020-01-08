import React from 'react';
import { Lbry, createNormalizedClaimSearchKey, parseURI, normalizeURI, isURIValid } from 'lbry-redux';
import {
  ActivityIndicator,
  Button,
  FlatList,
  NativeModules,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { navigateToUri } from 'utils/helper';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import PageHeader from 'component/pageHeader';
import FileListItem from 'component/fileListItem';
import FileResultItem from 'component/fileResultItem';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import UriBar from 'component/uriBar';
import searchStyle from 'styles/search';

const softLimit = 500;

class SearchPage extends React.PureComponent {
  state = {
    currentQuery: null,
    currentFrom: 0,
    currentUri: null,
    showTagResult: false,
    claimSearchRun: false,
    claimSearchOptions: null,
    resultsResolved: false,
    tagResultDisplayed: false,
  };

  static navigationOptions = {
    title: 'Search Results',
  };

  didFocusListener;

  componentWillMount() {
    const { navigation } = this.props;
    // this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
  }

  componentWillUnmount() {
    if (this.didFocusListener) {
      this.didFocusListener.remove();
    }
  }

  onComponentFocused = () => {
    const { pushDrawerStack, setPlayerVisible, query, search } = this.props;
    pushDrawerStack();
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Search').then(result => {
      const searchQuery = query || this.getSearchQuery();
      if (searchQuery && searchQuery.trim().length > 0) {
        this.setState({
          currentFrom: 0,
          currentQuery: searchQuery,
          currentUri: isURIValid(searchQuery) ? normalizeURI(searchQuery) : null,
          claimSearchOptions: null,
          claimSearchRun: false,
          showTagResult: false,
          resultsResolved: false,
          tagResultDisplayed: false,
        });
        search(searchQuery, 0);
      }
    });
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute, query, isSearching } = nextProps;
    const { currentRoute: prevRoute, search, isSearching: prevIsSearching } = this.props;

    if (Constants.DRAWER_ROUTE_SEARCH === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }

    if (query && query.trim().length > 0 && query !== this.state.currentQuery) {
      this.setState({
        currentFrom: 0,
        currentQuery: query,
        currentUri: isURIValid(query) ? normalizeURI(query) : null,
        resultsResolved: false,
        tagResultDisplayed: false,
      });
      search(query, 0);
    }
  }

  allContentResolved(props) {
    const { uris, resolvingUris } = props;
    if (!this.state.resultsResolved) {
      return false;
    }
    if (uris) {
      let allResolved = true;
      uris.forEach(uri => {
        allResolved = allResolved && !resolvingUris.includes(uri);
      });
      return allResolved;
    }

    return false;
  }

  /* shouldComponentUpdate(nextProps) {
    const { isSearching, uris } = this.props;
    return (isSearching && (!uris || uris.length === 0)) || (!isSearching && this.allContentResolved(this.props));
  } */

  componentDidUpdate() {
    const { claimSearchByQuery } = this.props;
    if (this.state.claimSearchRun && this.state.claimSearchOptions && !this.state.tagResultDisplayed) {
      const claimSearchKey = createNormalizedClaimSearchKey(this.state.claimSearchOptions);
      const claimSearchUris = claimSearchByQuery[claimSearchKey];
      this.setState({ showTagResult: claimSearchUris && claimSearchUris.length > 0, tagResultDisplayed: true });
    }
  }

  getSearchQuery() {
    const { navigation } = this.props;
    if (navigation && navigation.state && navigation.state.params) {
      return navigation.state.params.searchQuery;
    }
    return null;
  }

  handleSearchSubmitted = keywords => {
    const { search } = this.props;
    this.setState({
      currentUri: isURIValid(keywords) ? normalizeURI(keywords) : null,
      currentFrom: 0,
      currentQuery: keywords,
      claimSearchOptions: null,
      claimSearchRun: false,
      showTagResult: false,
      resultsResolved: false,
      tagResultDisplayed: false,
    });
    search(keywords, 0);
  };

  listEmptyComponent = () => {
    const { query } = this.props;
    return (
      <View style={searchStyle.noResults}>
        <Text style={searchStyle.noResultsText}>
          {__('There are no results to display for "%query%". Please try a different search term.', { query })}
        </Text>
      </View>
    );
  };

  listHeaderComponent = (showTagResult, query) => {
    const { navigation, claimSearch } = this.props;
    const { currentUri } = this.state;

    const canBeTag = query && query.trim().length > 0 && isURIValid(query);
    if (canBeTag && !this.state.claimSearchRun) {
      const options = {
        any_tags: [query.toLowerCase()],
        page: 1,
        no_totals: true,
      };
      this.setState({ claimSearchOptions: options, claimSearchRun: true }, () => claimSearch(options));
    }

    return (
      <View>
        <FileListItem uri={currentUri} featuredResult style={searchStyle.featuredResultItem} navigation={navigation} />
        {showTagResult && (
          <TouchableOpacity style={searchStyle.tagResultItem} onPress={() => this.handleTagResultPressed(query)}>
            <Text style={searchStyle.tagResultTitle}>#{query.toLowerCase()}</Text>
            <Text style={searchStyle.tagResultDescription}>{__('Explore content for this tag')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  handleTagResultPressed = tag => {
    const { navigation } = this.props;
    navigation.navigate({ routeName: Constants.DRAWER_ROUTE_TAG, key: `tagPage`, params: { tag: tag.toLowerCase() } });
  };

  handleVerticalEndReached = () => {
    // fetch more results
    const { lastPageReached, results, search, isSearching } = this.props;
    if (lastPageReached || (results && results.length > softLimit)) {
      return;
    }

    if (!isSearching) {
      const from = results ? results.length : 0;
      this.setState({ currentFrom: from }, () => {
        search(this.state.currentQuery, from);
      });
    }
  };

  render() {
    const { isSearching, navigation, query, results } = this.props;

    return (
      <View style={searchStyle.container}>
        <UriBar value={query} navigation={navigation} onSearchSubmitted={this.handleSearchSubmitted} />

        {isSearching && this.state.currentFrom === 0 && (
          <View style={searchStyle.busyContainer}>
            <ActivityIndicator size="large" color={Colors.NextLbryGreen} style={searchStyle.loading} />
          </View>
        )}

        {(!isSearching || this.state.currentFrom > 0) && (
          <FlatList
            extraData={this.state}
            style={searchStyle.scrollContainer}
            contentContainerStyle={searchStyle.scrollPadding}
            keyboardShouldPersistTaps={'handled'}
            data={results}
            keyExtractor={(item, index) => item.claimId}
            initialNumToRender={10}
            maxToRenderPerBatch={20}
            onEndReached={this.handleVerticalEndReached}
            onEndReachedThreshold={0.2}
            removeClippedSubviews
            ListEmptyComponent={!isSearching ? this.listEmptyComponent() : null}
            ListHeaderComponent={this.listHeaderComponent(this.state.showTagResult, this.state.currentQuery)}
            renderItem={({ item }) => (
              <FileResultItem key={item.claimId} result={item} style={searchStyle.resultItem} navigation={navigation} />
            )}
          />
        )}
        {this.state.currentFrom > 0 && isSearching && (
          <View style={searchStyle.moreLoading}>
            <ActivityIndicator size="small" coolor={Colors.NextLbryGreen} />
          </View>
        )}
        <FloatingWalletBalance navigation={navigation} />
      </View>
    );
  }
}

export default SearchPage;
