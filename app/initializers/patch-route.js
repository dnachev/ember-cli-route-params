import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject } from '@ember/service';

function initialize() {
  Route.reopen({
    contextManager: inject('context-manager'),
 
    afterModel(model) {
      const result = this._super(...arguments);
      // TODO Handle promises
      this.get('contextManager').addRoute(this, model);
      return result;
    },

    getRouteModelParams(...paramNames) {
      const params = get(this, 'contextManager').getRouteModelParams(this, paramNames);
      return params;
    },

    deactivate() {
      this._super(...arguments);
      this.get('contextManager').validateRouteCleanup(this);
    },
  });
}

export default {
  initialize,
  name: 'route-context',
}
