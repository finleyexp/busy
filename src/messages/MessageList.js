/* global window, document */
import React, { Component, PropTypes } from 'react';
import Infinite from 'react-infinite';
import InfiniteAnyHeight from 'react-infinite-any-height';
import map from 'lodash/map';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';
import ReduxInfiniteScroll from 'redux-infinite-scroll';

import './MessageList.scss';
import MessageDateGroup from './MessageDateGroup';
import { groupMessagesByDate } from './messageGroupHelpers';
import { sendReadAcknoledgement } from './messagesActions';


class InfiniteScroll extends Component {
  renderLoader() {
    if (!this.props.loadingMore) return null;
    return this.props.loader;
  }

  componentDidMount() {
    window.addEventListener('scroll', this.scrollFunction, true);
    window.addEventListener('resize', this.scrollFunction, true);
  }

  componentDidUpdate() {
    window.addEventListener('scroll', this.scrollFunction, true);
    window.addEventListener('resize', this.scrollFunction, true);
  }

  scrollFunction = () => {
    if (this.props.loadingMore) return;
    if (!this.props.children || this.props.children.length === 0) return;

    const topPosition = (window.pageYOffset !== undefined)
      ? window.pageYOffset
      : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    console.log(topPosition);
    if (topPosition < 100) {
      this.props.loadMore();
    }
  };

  render() {
    return (
      <div>
        {this.renderLoader()}
        {this.props.children}
      </div>
    );
  }
}

class MessageList extends Component {
  static propTypes = {
    messages: PropTypes.array.isRequired,
  };

  sendReadAcks() {
    this.props.sendReadAcknoledgement(this.props.messages);
  }

  constructor(props) {
    super(props);
    this.state = {
      containerHeight: 1000,
    };
  }

  componentDidMount() {
    this.sendReadAcks();
    this.setState({
      containerHeight: document.body.innerHeight,
    });
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  componentDidUpdate() {
    this.sendReadAcks();

    document.body.scrollTop = document.body.scrollHeight;
    // Firefox Compatibility while document.scrollingElement isn't available
    document.documentElement.scrollTop = document.documentElement.scrollHeight;
  }

  onResize = debounce(() => {
    this.setState({
      containerHeight: document.body.innerHeight,
    });
  }, 100);

  render() {
    const { messages, username } = this.props;
    const dateGroups = groupMessagesByDate(messages);
    const messageEls = map(dateGroups, (dateGroup, i) => (
      <MessageDateGroup
        key={dateGroup.day}
        model={dateGroup}
      />
    ));

    console.log('MessageList::render')

    return (
      <div className="MessageList messages-content media-list">
        {/*
        <div className="py-4 text-center">
          {username
            ? <p className="mb-4">
              This is the beginning of your private message history with <b>@{username}</b>.
            </p>
            : <p className="mb-4">
              This is the beginning of the chat.
            </p>
          }
        </div>
        */}

        <InfiniteScroll
          loadMore={this.props.fetchMoreMessages}
          loadingMore={this.props.isLoading}
          threshold={100}
          elementIsScrollable={false}
          loader={
            <div style={{zIndex: 10}} className="text-center">Loading More messages</div>
          }
        >
          {messageEls}
        </InfiniteScroll>
        {/*
        <InfiniteAnyHeight
          key="infinite-scrolling"
          list={messageEls}
          preloadBatchSize={Infinite.containerHeightScaleFactor(2)}
          infiniteLoadBeginEdgeOffset={1}
          loadingSpinnerDelegate={
            <div className="text-center">Loading More messages</div>
          }
          isInfiniteLoading={this.state.isInfiniteLoading || this.props.isLoading}
          displayBottomUpwards
          onInfiniteLoad={() => {
            this.setState({
              isInfiniteLoading: true,
            });
            setTimeout(() => {
              this.props.fetchMoreMessages();
              this.setState({
                isInfiniteLoading: false,
              });
            }, 3000);
          }}
          useWindowAsScrollContainer
          containerHeight={window.innerHeight - 112}
        />
        */}
      </div>
    );
  }
}

MessageList = connect(() => ({}), {
  sendReadAcknoledgement,
})(MessageList);

export default MessageList;
