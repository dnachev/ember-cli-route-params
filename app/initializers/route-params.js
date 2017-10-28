import Route from '@ember/routing/route';
import { getRouteParams } from 'ember-cli-route-params/utils/route-params';
import { get, set } from '@ember/object';

function initialize() {
  Route.reopen({
    getRouteParams(...paramNames) {
      return getRouteParams(this, paramNames);
    },

    renderTemplate(controller) {
      let routeParamsNames;
      let routeParams = null;
      if ((routeParamsNames = get(this, 'routeParams')) != null) {
        routeParams = getRouteParams(this, routeParamsNames);
      }
      set(controller, 'routeParams', routeParams);
      this._super(...arguments);
    },
  });
}

export default {
  initialize,
  name: 'route-params',
}
