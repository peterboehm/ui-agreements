import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import compose from 'compose-function';

import { stripesConnect } from '@folio/stripes/core';

import withFileHandlers from './components/withFileHandlers';
import View from '../components/views/AgreementForm';
import NoPermissions from '../components/NoPermissions';
import { urls } from '../components/utilities';

class AgreementCreateRoute extends React.Component {
  static manifest = Object.freeze({
    agreements: {
      type: 'okapi',
      path: 'erm/sas',
      fetch: false,
      shouldRefresh: () => false,
    },
    agreementStatusValues: {
      type: 'okapi',
      path: 'erm/refdataValues/SubscriptionAgreement/agreementStatus',
      shouldRefresh: () => false,
    },
    contactRoleValues: {
      type: 'okapi',
      path: 'erm/refdataValues/InternalContact/role',
      shouldRefresh: () => false,
    },
    externalAgreementLine: {
      type: 'okapi',
      path: 'erm/entitlements/external',
      shouldRefresh: () => false,
      params: {
        authority: '?{authority}',
        reference: '?{referenceId}',
      },
      throwErrors: false,
    },
    isPerpetualValues: {
      type: 'okapi',
      path: 'erm/refdataValues/SubscriptionAgreement/isPerpetual',
      shouldRefresh: () => false,
    },
    licenseLinkStatusValues: {
      type: 'okapi',
      path: 'erm/refdataValues/RemoteLicenseLink/status',
      shouldRefresh: () => false,
    },
    orgRoleValues: {
      type: 'okapi',
      path: 'erm/refdataValues/SubscriptionAgreementOrg/role',
      shouldRefresh: () => false,
    },
    renewalPriorityValues: {
      type: 'okapi',
      path: 'erm/refdataValues/SubscriptionAgreement/renewalPriority',
      shouldRefresh: () => false,
    },
    basket: { initialValue: [] },
  });

  static propTypes = {
    handlers: PropTypes.object,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      agreements: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      agreement: PropTypes.object,
      orgRoleValues: PropTypes.object,
      statusValues: PropTypes.object,
      terms: PropTypes.object,
      typeValues: PropTypes.object,
    }).isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      okapi: PropTypes.object.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    handlers: {},
  }

  constructor(props) {
    super(props);

    this.state = {
      hasPerms: props.stripes.hasPerm('ui-agreements.agreements.edit'),
    };
  }

  handleClose = () => {
    const { location } = this.props;
    this.props.history.push(`${urls.agreements()}${location.search}`);
  }

  handleSubmit = (agreement) => {
    const { history, location, mutator } = this.props;

    mutator.agreements
      .POST(agreement)
      .then(({ id }) => {
        history.push(`${urls.agreementView(id)}${location.search}`);
      });
  }

  fetchIsPending = () => {
    return Object.values(this.props.resources)
      .filter(r => r && r.resource !== 'agreements')
      .some(r => r.isPending);
  }

  render() {
    const { handlers, resources } = this.props;

    if (!this.state.hasPerms) return <NoPermissions />;

    return (
      <View
        data={{
          agreementStatusValues: get(resources, 'agreementStatusValues.records', []),
          contactRoleValues: get(resources, 'contactRoleValues.records', []),
          externalAgreementLine: get(resources, 'externalAgreementLine.records', []),
          isPerpetualValues: get(resources, 'isPerpetualValues.records', []),
          licenseLinkStatusValues: get(resources, 'licenseLinkStatusValues.records', []),
          orgRoleValues: get(resources, 'orgRoleValues.records', []),
          renewalPriorityValues: get(resources, 'renewalPriorityValues.records', []),
          users: [],
        }}
        handlers={{
          ...handlers,
          onClose: this.handleClose,
        }}
        isLoading={this.fetchIsPending()}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

export default compose(
  withFileHandlers,
  stripesConnect
)(AgreementCreateRoute);
