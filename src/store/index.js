import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

import {find} from '@/utils';

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,

    state: {
        components: {
            stage: {
                template: `<div class='stage'>
                    <meta-component for="counter"></meta-component>
                </div>`,
            },

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

        compiling: false,
    },

    // getter(state, getters)
    getters: {
        component(state, getters) {
            return (name) => {
                return find(state.components, name, {});
            };
        },

        instance(state, getters) {
            return (key) => {
                return find(state.instances, key, {});
            };
        },

        instanceData(state, getters) {
            return (key, path, def) => {
                return find(state.instances, `${key}.${path}`, def);
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
            console.log("sendTo:", `${componentName}#${instanceId}`, `msg: ${message}`, "args:", payload);

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
        },

        update({ commit }, {componentName, component})
        {
            commit('updateComponent', {componentName, component});
        },
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

            let instanceKey = `${componentName}#${instanceId}`;

            Vue.set(state.instances, instanceKey, instance);
        },

        // Update the state of an instance
        update(state, {componentName, instanceId, instance, callback}) {
            let instanceKey     = `${componentName}#${instanceId}`;
            let currentInstance = state.instances[instanceKey];

            callback(currentInstance);

            Vue.set(state.instances, instanceKey, currentInstance);
        },

        updateComponent(state, {componentName, component}) {
            console.log("updateComponent", componentName, component);
            Vue.set(state.components, componentName, component);
        },

        compiling(state, status) {
            state.compiling = status;
        },
    },
});
