import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

import {find} from '@/utils';
import EventBus from '@/events/index';

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,

    state: {
        components: {
            stage: {
                template: `<div class='stage'>
                    <div>Total: <span v-text="get('total')"></span></div>
                    <meta-component v-for="n in get('nb')" :key="n" @changed="send('update', {index: n, value: $event})" for="counter"></meta-component>
                    <meta-component for="light"></meta-component>
                    <meta-component for="discussion"></meta-component>
                </div>`,

                state: {
                    nb:  3,
                    sub: [0, 0],
                },

                getters: {
                    total(state) {
                        return state.sub.reduce((r, s) => r + s, 0);
                    },
                },

                actions: {
                    update({ commit }, payload) {
                        commit('update', payload);
                    },
                },

                mutations: {
                    update(state, { index, value }) {
                        Vue.set(state.sub, index, value);
                    },
                },
            },

            light: {
                template: `<button @click="send('toggle')" :class="get('css')">
                    <span v-html="get('html')"></span>
                </button>`,

                state: {
                    on: false,
                },

                actions: {
                    toggle({commit}, payload) {
                        commit('toggle', payload);
                    },
                },

                mutations: {
                    toggle(state) {
                        state.on = ! state.on;
                    },
                },

                getters: {
                    html(state, getters) {
                        return state.on ? "<i class='fa fa-star'></i>" : "<i class='fa fa-bolt'></i>";
                    },

                    css(state, getters) {
                        return state.on ? "button is-danger" : "button is-info";
                    },
                },
            },

            counter: {
                template: `<div class='counter'>
                    <button :class="get('css', 'button is-danger')" @click="send('increment')" v-text="get('count', -1)"></button><button class="button is-danger" v-if="get('hasClicked')" @click="send('reset')">X</button>
                </div>`,

                state: {
                    count: 0,
                },

                actions: {
                    reset({state, commit, emit}, payload) {
                        commit('reset');
                        emit('changed', state.count);
                    },

                    increment({state, commit, emit}, payload) {
                        commit('increment');
                        emit('changed', state.count);
                    },
                },

                mutations: {
                    increment(state) {
                        state.count++;
                    },

                    reset(state) {
                        state.count = 0;
                    },
                },

                getters: {
                    hasClicked(state, getters) {
                        return state.count > 0;
                    },

                    css(state, getters) {
                        if (getters.hasClicked(state, getters)) {
                            return "button is-info";
                        }

                        return "button is-warning";
                    },
                },
            },

            discussion: {
                template: `<div class='chat'>
                    <div class="discussion">
                        <article class="message"
                            v-for="message in get('messages', [])">
                            <div class="message-body" v-text="message"></div>
                        </article>
                    </div>
                    <div class="controls">
                        <div class="field has-addons">
                            <div class="control">
                                <input class="input" type="text" placeholder="Enter a message" :value="get('text')" @input="send('update', $event)">
                            </div>
                            <div class="control">
                                <button class="button is-info" @keyup.enter="send('send')" @click="send('send')">
                                  Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`,

                state: {
                    messages: ['this is a first message', 'second one'],
                    text: '',
                },

                actions: {
                    update({ commit }, $event) {
                        let value = $event.target.value;

                        commit('update', value);
                    },

                    send({ state, commit }, payload) {
                        if (state.text != "") {
                            commit('send');
                        }
                    },
                },

                mutations: {
                    update(state, text) {
                        state.text = text;
                    },

                    send(state) {
                        state.messages.push(state.text);
                        state.text = "";
                    },
                },
            },
        },

        // Instances data
        instances: {},

        // Instances events/bus
        events: {},

        debug: false,
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

        find(state, getters) {
            return (name, id, path, def) => {
                let key = `${name}#${id}`;

                let data    = find(state.instances, key, {});
                let getters = find(state.components, `${name}.getters`, {});
                let getter  = find(getters, path);

                // Trying in state if no getter found
                if (! getter) {
                    return find(data, path, def);
                }

                // Trying in getters
                return getter(data, getters);
            };
        },

        computed(state) {
            return (name, id) => {
                let key     = `${name}#${id}`;
                let getters = find(state.components, `${name}.getters`, {});
                let data    = find(state.instances, key, {});

                return Object.entries(getters).reduce((computed, [name, cb]) => {
                    computed[name] = cb(data, getters);

                    return computed;
                }, {});
            };
        },
    },

    actions: {
        // Lookup for a given message in an instance
        // [Example: execute "increment" in a "counter" instance]
        send(context, { componentName, instanceId, message, payload })
        {
            if (context.state.debug) {
                console.log("send:", message, `to: ${componentName}#${instanceId}`, "args:", payload);
            }

            // Get component action
            // [counter.increment callback]
            let component   = context.state.components[componentName];
            let action      = component.actions[message];
            let instanceKey = `${componentName}#${instanceId}`;
            let instance    = context.state.instances[instanceKey];

            // Call component method with overwritten context
            let subContext = Object.assign({}, context);

            subContext.state = instance;

            // Dispatching another command
            subContext.dispatch = (actionName, subPayload) => {
                let subAction = component.actions[actionName];

                // = Calling directly the function with the same arguments
                subAction(subContext, subPayload);
            };

            // Committing something
            subContext.commit = (mutationName, subPayload) => {
                let callback = component.mutations[mutationName];

                // = Swapping state of an instance
                context.commit('swap', {
                    componentName,
                    instanceId,
                    callback,
                    payload: subPayload,
                });
            };

            subContext.emit = (eventName, subPayload) => {
                let instanceEvents = context.state.events[instanceKey];

                instanceEvents.$emit(eventName, subPayload);
            },

            // We call the action [counter.increment] with our context
            action(subContext, payload);
        },

        // Create a base component
        create({ commit }, {componentName}) {
            console.log("create", componentName);

            let component = {
                template: `<div>${componentName}</div>`,
            };

            commit('update', {componentName, component});
        },

        // Update component
        update({ commit }, {componentName, component}) {
            // @NOTE: using action if case of expanding code / logs
            commit('update', {componentName, component});
        },
    },

    mutations: {
        // Update component `component = {...}`
        update(state, {componentName, component}) {
            Vue.set(state.components, componentName, component);
        },

        // Create an instance of a component `new component`
        instantiate(state, self) {
            let componentName = self.for;
            let instanceId    = self.id;

            if (! state.instances[componentName]) {
                state.instances[componentName] = {};
            }

            let component   = state.components[componentName];
            let instance    = Object.assign({}, component.state);
            let instanceKey = `${componentName}#${instanceId}`;

            Vue.set(state.events, instanceKey, {
                $emit:   self.$emit,
                _events: self._events,
            });

            Vue.set(state.instances, instanceKey, instance);
        },

        // Swap instance data with callback(data) `swap! instance`
        swap(state, {componentName, instanceId, callback, payload }) {
            let instanceKey     = `${componentName}#${instanceId}`;
            let currentInstance = state.instances[instanceKey];

            // Changing currentInstance by ref, no return needed
            callback(currentInstance, payload);

            Vue.set(state.instances, instanceKey, currentInstance);
        },
    },
});
