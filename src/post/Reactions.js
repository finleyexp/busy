import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import numeral from 'numeral';
import { FormattedMessage } from 'react-intl';
import { Tooltip } from 'pui-react-tooltip';
import { OverlayTrigger } from 'pui-react-overlay-trigger';
import {
  sortVotes,
  getUpvotes,
  getDownvotes,
  getFollowingUpvotes,
  getFollowingDownvotes
} from '../helpers/voteHelpers';
import Avatar from '../widgets/Avatar';
import Icon from '../widgets/Icon';
import './Reactions.scss';

@connect(
  state => ({
    following: state.user.following.list,
  })
)
export default class Reactions extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { post: { active_votes: activeVotes, children }, following } = this.props;
    const upvotes = getUpvotes(activeVotes);
    const downvotes = getDownvotes(activeVotes);
    const followingUpvotes = sortVotes(getFollowingUpvotes(activeVotes, following), 'rshares')
      .reverse().slice(0, 5);
    const followingDownvotes = sortVotes(getFollowingDownvotes(activeVotes, following), 'rshares')
      .reverse().slice(0, 5);
    return (
      (upvotes.length > 0 || downvotes.length > 0 || children > 0) &&
        <div className="Reactions py-2 px-3 text-left">
          {upvotes.length > 0 &&
            <span className="mr-2">
              <Icon name="thumb_up" xs />
              {' '}
              <span className="hidden-xs">
                {followingUpvotes.map((vote, idx) =>
                  <span key={idx} className="mr-1">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>{vote.voter}</Tooltip>}
                    >
                      <Link to={`/@${vote.voter}`}><Avatar username={vote.voter} xs /></Link>
                    </OverlayTrigger>
                  </span>
                )}
              </span>
              {' '}
              <a onClick={this.props.handleShowLikesRequest}>
                {numeral(upvotes.length).format('0,0')} <FormattedMessage id="likes" />
              </a>
            </span>
          }
          {downvotes.length > 0 &&
            <span className="mr-2">
              <Icon name="thumb_down" xs />
              {' '}
              <span className="hidden-xs">
                {followingDownvotes.map((vote, idx) =>
                  <span key={idx} className="mr-1">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>{vote.voter}</Tooltip>}
                    >
                      <a><Avatar username={vote.voter} xs /></a>
                    </OverlayTrigger>
                  </span>
                )}
              </span>
              {' '}
              <a onClick={this.props.handleShowLikesRequest}>
                {numeral(downvotes.length).format('0,0')} <FormattedMessage id="dislikes" />
              </a>
            </span>
          }
          {children > 0 &&
            <span className="ml-2 pull-right">
              <Icon name="reply" xs />
              {' '}
              <a onClick={this.props.handleShowCommentsRequest}>
                {numeral(children).format('0,0')} <FormattedMessage id="comments" />
              </a>
            </span>
          }
        </div>
    );
  }
}
