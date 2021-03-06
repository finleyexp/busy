import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Icon from '../../widgets/Icon';
import Avatar from '../../widgets/Avatar';

function StatusIndicator({ isOnline }) {
  return (
    <span
      style={{
        borderRadius: '100%',
        display: 'inline-block',
        marginLeft: 5,
        width: 10,
        height: 10,
        backgroundColor: isOnline ? 'green' : 'gray',
      }}
    />
  );
}

StatusIndicator = connect(
  (state, { username }) => ({
    isOnline: state.messages.users[username],
  })
)(StatusIndicator);

const MenuUser = ({ auth, username }) =>
  <ul className="app-nav">
    <li>
      <Link to={`/@${username}`} activeClassName="active">
        <Avatar username={username} xs />{' '}
        <span className="hidden-xs">{username}
          <StatusIndicator username={username} />
        </span>
      </Link>
    </li>
    <li>
      <Link to={`/@${username}/feed`} activeClassName="active">
        <Icon name="subject" />{' '}
        <span className="hidden-xs"><FormattedMessage id="feed" /></span>
      </Link>
    </li>
    <li>
      <Link to={`/@${username}/transfers`} activeClassName="active">
        <Icon name="account_balance_wallet" />{' '}
        <span className="hidden-xs"><FormattedMessage id="wallet" /></span>
      </Link>
    </li>
    {auth.isAuthenticated &&
      <li>
        <Link to={`/messages/@${username}`} activeClassName="active">
          <Icon name="chat_bubble_outline" />{' '}
          <span className="hidden-xs">
            <FormattedMessage id="messages" />
          </span>
        </Link>
      </li>
    }
  </ul>;

export default MenuUser;
