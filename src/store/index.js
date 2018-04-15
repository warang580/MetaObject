import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

import {find} from '@/utils';

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,

    state: {
        components: {
            counter: {
                template: `<div class='meta'>
                    <button class="button is-info" @click="send('increment')" v-text="get('count', -1)"></button>
                </div>`,

                actions: {
                    increment({commit}, payload) {
                        commit('increment');
                    },
                },

                mutations: {
                    increment(state) {
                        state.count++;
                    },
                },

                data: {
                    count: 0,
                },
            },
        },

        instances: {},
    },

    // getter(state, getters)
    getters: {
        component(state, getters) {
            return (name) => {
                return find(state.components, `${name}`, {});
            };
        },

        instance(state, getters) {
            return (name, id) => {
                return find(state.instances, `${name}.${id}`, {});
            };
        },

        instanceData(state, getters) {
            return (name, id, key, def) => {
                return find(state.instances, `${name}.${id}.${key}`, def);
            };
        },
    },

    // action({ state, commit }, payload)
    actions: {
        send(context, { componentName, instanceId, message, payload })
        {
            let component = context.state.components[componentName];
            let instance  = context.state.instances[componentName][instanceId];
            let action    = component.actions[message];

            // Call component method with correct context
            console.log("send", `to: ${componentName}#${instanceId}`, `msg: ${message}`, "args:", payload);

            let subContext = Object.assign({}, context);

            subContext.dispatch = (actionName, subPayload) => {
                let subAction = component.actions[actionName];

                subAction(subContext, subPayload);
            };

            subContext.commit = (mutationName, subPayload) => {
                let subMutation = component.mutations[mutationName];

                context.commit('update', {
                    componentName,
                    instanceId,
                    instance,
                    callback: subMutation,
                });
            };

            action(subContext, payload);
        }
    },

    mutations: {
        // Create an instance of a component
        create(state, self) {
            let componentName = self.for;
            let instanceId    = self.id;

            if (! state.instances[componentName]) {
                state.instances[componentName] = {};
            }

            let component = state.components[componentName];
            let instance  = Object.assign({}, component.data);

            console.log("create", `${componentName}#${instanceId}`, instance);

            state.instances[componentName][instanceId] = instance;
        },

        // Update the state of an instance
        update(state, {componentName, instanceId, instance, callback}) {
            // @TODO: remove .data ?
            let currentInstance = state.instances[componentName][instanceId];

            callback(currentInstance);

            console.log("update", `${componentName}#${instanceId}`, currentInstance);

            state.instances[componentName][instanceId] = currentInstance;
        },
    },
});
