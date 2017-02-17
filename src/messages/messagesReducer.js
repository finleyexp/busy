import assert from 'assert';
import extend from 'lodash/extend';
import keyBy from 'lodash/keyBy';
import omit from 'lodash/omit';
import size from 'lodash/size';
import uniqBy from 'lodash/uniqBy';

import * as actions from './messagesActions';
import { actions as backgroundActions } from './messagesBackground';

// type Channel = {
//   channelName: String,
//   isLoading: Boolean,
//   latest: Array,
//   users: Object,
// }

const initialState = {
  channels: {},
  users: {},
  messages: {},
  unreadMessages: {},
  username: null,

  isLoading: true,
  isConnected: false,
};

function mergeMessages(state, messages) {
  return extend({}, state, {
    messages: keyBy(messages, 'uuid'),
  });
}

export default function messagesReducer(state = initialState, action) {
  switch (action.type) {
    case '@auth/LOGIN_SUCCESS': {
      return extend({}, state, {
        username: action.user.name,
      });
    }

    case backgroundActions.USER_JOIN: {
      return extend({}, state, {
        users: {
          ...state.users,
          [`${action.payload.senderUsername}`]: true,
        },
      });
    }

    case backgroundActions.USER_LEAVE: {
      return extend({}, state, {
        users: omit(state.users, [action.payload.senderUsername]),
      });
    }

    case backgroundActions.USER_UNREAD_MESSAGES: {
      return extend({}, state, {
        unreadMessages: action.payload,
      });
    }

    case actions.SEND_MESSAGE_REQUEST_SUCCESS: {
      assert(
        action.meta.message.uuid === action.payload.uuid,
        // eslint-disable-next-line prefer-template
        'UUID in ACK is wrong? (sent uuid = ' +
          action.meta.message.uuid +
          ', received uuid = ' +
          action.payload.uuid +
          ')'
      );
      const channel = extend({}, state.channels[action.meta.message.channelName]) || {
        channelName: action.meta.message.channelName,
        users: {},
        latest: []
      };

      // action.meta.message.origin = 'SEND_MESSAGE_REQUEST';
      channel.users = extend({}, channel.users, {
        [`${action.meta.message.senderUsername}`]: true,
      });
      channel.latest = uniqBy((channel.latest || []).concat([action.meta.message]), 'uuid');

      const channels = extend({}, state.channels, {
        [`${action.meta.message.channelName}`]: channel,
      });

      return extend({}, state, {
        channels,
      });
    }

    case backgroundActions.USER_MESSAGE: {
      const channel = extend({}, state.channels[action.payload.channelName]) || {
        channelName: action.payload.channelName,
        users: {},
        latest: []
      };

      channel.users = extend({}, channel.users, {
        [`${action.payload.senderUsername}`]: true,
      });
      // action.payload.origin = 'USER_MESSAGE';
      channel.latest = uniqBy(
        (channel.latest || []).concat(action.payload),
        'uuid'
      );

      const channels = extend({}, state.channels, {
        [`${action.payload.channelName}`]: channel,
      });

      const unreadMessages =
        action.payload.senderUsername === state.username ||
          !Array.isArray(action.payload.channelName)
        ? extend({}, state.unreadMessages)
        : {
          ...state.unreadMessages,
          [`${action.payload.uuid}`]: action.payload,
        };

      return extend({}, state, {
        channels,
        unreadMessages,
      });
    }

    case actions.USER_MESSAGE_READ_SUCCESS: {
      return extend({}, state, {
        unreadMessages: omit(state.unreadMessages, action.meta.uuids),
      });
    }

    case backgroundActions.ERROR: {
      return state;
    }

    case backgroundActions.CONNECTED: {
      return extend({}, state, {
        isConnected: true,
      });
    }

    case backgroundActions.DISCONNECTED: {
      return extend({}, state, {
        isConnected: false,
      });
    }

    case actions.FETCH_CHANNEL_PRESENCE_START: {
      return extend({}, state, {
        isLoading: true,
      });
    }

    case actions.FETCH_CHANNEL_PRESENCE_SUCCESS: {
      if (!action.payload) return state;

      const channel = state.channels[action.payload.channelName] || {
        users: [],
        latest: [],
        nmembers: 0,
      };
      console.log(channel)

      const latest = uniqBy((channel.latest || []).concat(action.payload.latest), 'uuid');

      return extend({}, state, {
        isLoading: false,
        users: extend({}, state.users, action.payload.users.reduce((m, { username }) => ({
          ...m,
          [username]: true,
        }), {})),
        channels: extend({}, state.channels, {
          [`${action.payload.channelName}`]: extend({}, action.payload, {
            nmembers: size(action.payload.users),
            latest,
          }),
        })
      });
    }

    case actions.FETCH_MESSAGES_SUCCESS: {
      return extend({}, state, {
        unreadMessages: extend(
          {},
          state.unreadMessages,
          keyBy(action.payload.unreadMessages, 'uuid')
        ),
      });
    }

    default: {
      return state;
    }
  }
}
