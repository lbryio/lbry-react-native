// @flow
import React from 'react';
// import BusyIndicator from 'component/common/busy-indicator';
import { Text, View } from 'react-native';
import Button from 'component/button';
import Link from 'component/link';
import TransactionList from 'component/transactionList';
import type { Transaction } from 'component/transactionList/view';
import walletStyle from 'styles/wallet';

type Props = {
  fetchTransactions: () => void,
  fetchingTransactions: boolean,
  hasTransactions: boolean,
  transactions: Array<Transaction>,
};

class TransactionListRecent extends React.PureComponent<Props> {
  componentDidMount() {
    this.props.fetchTransactions();
  }

  render() {
    const { fetchingTransactions, hasTransactions, transactions, navigation } = this.props;

    return (
      <View style={walletStyle.transactionsCard}>
        <View style={[walletStyle.row, walletStyle.transactionsHeader]}>
          <Text style={walletStyle.transactionsTitle}>{__('Recent Transactions')}</Text>
          <Link style={walletStyle.link} navigation={navigation} text={__('View All')} href={'#TransactionHistory'} />
        </View>
        {fetchingTransactions && <Text style={walletStyle.infoText}>{__('Fetching transactions...')}</Text>}
        {!fetchingTransactions && (
          <TransactionList
            navigation={navigation}
            transactions={transactions.slice(0, 5)}
            emptyMessage={__("Looks like you don't have any recent transactions.")}
          />
        )}
      </View>
    );
  }
}

export default TransactionListRecent;
