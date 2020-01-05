import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';
import { formatCredits, formatFullPrice } from 'lbry-redux';
import Icon from 'react-native-vector-icons/FontAwesome5';

class CreditAmount extends React.PureComponent {
  static propTypes = {
    amount: PropTypes.number.isRequired,
    precision: PropTypes.number,
    isEstimate: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    showFree: PropTypes.bool,
    showFullPrice: PropTypes.bool,
    showPlus: PropTypes.bool,
    look: PropTypes.oneOf(['indicator', 'plain', 'fee']),
  };

  static defaultProps = {
    precision: 2,
    label: true,
    showFree: false,
    look: 'indicator',
    showFullPrice: false,
    showPlus: false,
  };

  render() {
    const minimumRenderableAmount = Math.pow(10, -1 * this.props.precision);
    const { amount, precision, showFullPrice, style } = this.props;

    let formattedAmount;
    const fullPrice = formatFullPrice(amount, 2);

    if (showFullPrice) {
      formattedAmount = fullPrice;
    } else {
      formattedAmount =
        amount > 0 && amount < minimumRenderableAmount
          ? `<${minimumRenderableAmount}`
          : formatCredits(amount, precision);
    }

    let amountText;
    if (this.props.showFree && parseFloat(this.props.amount) === 0) {
      amountText = __('FREE');
    } else {
      if (this.props.label) {
        const label =
          typeof this.props.label === 'string'
            ? this.props.label
            : parseFloat(amount) === 1
              ? __('credit')
              : __('credits');
        // TODO: handling singular / plural in other languages?

        amountText = `${formattedAmount} ${label}`;
      } else {
        amountText = formattedAmount;
      }
      if (this.props.showPlus && amount > 0) {
        amountText = `+${amountText}`;
      }
    }

    return (
      <Text style={style} numberOfLines={1}>
        {amountText}
      </Text>
    );
  }
}

class FilePrice extends React.PureComponent {
  componentWillMount() {
    const { cost } = this.props;
    if (isNaN(parseFloat(cost))) {
      this.fetchCost(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { cost } = this.props;
    if (isNaN(parseFloat(cost))) {
      this.fetchCost(nextProps);
    }
  }

  fetchCost(props) {
    const { costInfo, fetchCostInfo, uri, fetching, claim } = props;

    if (costInfo === undefined && !fetching && claim) {
      fetchCostInfo(uri);
    }
  }

  render() {
    const { cost, costInfo, look = 'indicator', showFullPrice = false, style, iconStyle, textStyle } = this.props;

    const isEstimate = costInfo ? !costInfo.includesData : null;
    const amount = cost ? parseFloat(cost) : costInfo ? parseFloat(costInfo.cost) : 0;
    if (!costInfo || isNaN(amount) || amount === 0) {
      return null;
    }

    return (
      <View style={style}>
        <Icon name="coins" size={9} style={iconStyle} />
        <CreditAmount
          style={textStyle}
          label={false}
          amount={amount}
          isEstimate={isEstimate}
          showFree
          showFullPrice={showFullPrice}
        />
      </View>
    );
  }
}

export default FilePrice;
