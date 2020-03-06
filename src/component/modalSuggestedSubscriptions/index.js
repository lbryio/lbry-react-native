import { connect } from 'react-redux';
import { selectFetchingClaimSearch } from 'lbry-redux';
import ModalSuggestedSubscriptions from './view';

const select = state => ({
  loadingSuggested: selectFetchingClaimSearch(state),
});

export default connect(select)(ModalSuggestedSubscriptions);
