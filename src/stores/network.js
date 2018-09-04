import Client from 'pvw-lightviz/src/io/Client';
import { Mutations, Actions } from 'pvw-lightviz/src/stores/types';

export default {
  state: {
    client: null,
    config: null,
  },
  getters: {
    NETWORK_CLIENT(state) {
      return state.client;
    },
    NETWORK_CONFIG(state) {
      return state.config;
    },
  },
  mutations: {
    NETWORK_CLIENT_SET(state, client) {
      state.client = client;
    },
    NETWORK_CONFIG_SET(state, config) {
      state.config = config;
    },
  },
  actions: {
    NETWORK_CONNECT({ commit, dispatch, state }) {
      const { config, client } = state;
      if (client && client.isConnected()) {
        client.disconnect();
      }
      const clientToConnect = client || new Client();
      clientToConnect
        .connect(config)
        .then((validClient) => {
          commit(Mutations.NETWORK_CLIENT_SET, validClient);
          dispatch(Actions.PROXY_PIPELINE_FETCH);
          dispatch(Actions.APP_ROUTE_RUN);
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};