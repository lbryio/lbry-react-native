import React from 'react';
import { ActivityIndicator, NativeModules, View, ScrollView, Text } from 'react-native';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import EmptyStateView from 'component/emptyStateView';
import TransactionList from 'component/transactionList';
import UriBar from 'component/uriBar';
import walletStyle from 'styles/wallet';

class TransactionHistoryPage extends React.PureComponent {
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
    const { fetchTransactions, pushDrawerStack, setPlayerVisible } = this.props;
    pushDrawerStack();
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Transaction History').then(result => {
      fetchTransactions();
    });
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.DRAWER_ROUTE_TRANSACTION_HISTORY === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  render() {
    const { fetchingTransactions, transactions, navigation } = this.props;

    return (
      <View style={walletStyle.container}>
        <UriBar navigation={navigation} />
        {fetchingTransactions && (
          <View style={walletStyle.loadingContainer}>
            <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />
            <Text style={walletStyle.loadingText}>{__('Loading transactions...')}</Text>
          </View>
        )}
        {!fetchingTransactions && transactions.length === 0 && (
          <EmptyStateView message={__('No transactions to list.')} />
        )}
        <ScrollView style={walletStyle.transactionHistoryScroll}>
          <View style={walletStyle.historyList}>
            {!fetchingTransactions && transactions && transactions.length > 0 && (
              <TransactionList navigation={navigation} transactions={transactions} />
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default TransactionHistoryPage;
