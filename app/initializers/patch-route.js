import Route from '@ember/routing/route';
import { get, set } from '@ember/object';
import { inject } from '@ember/service';

function initialize() {
  Route.reopen({
    routeParams: inject('route-params'),

    getRouteModelParams(...paramNames) {
      // TODO Validate 
      const params = get(this, 'routeParams').getRouteModelParams(this, paramNames);
      return params;
    },

    renderTemplate(controller) {
      let modelParamNames;
      let modelParams = null;
      if ((modelParamNames = get(this, 'routeModelParams')) != null) {
        modelParams = this.getRouteModelParams(...modelParamNames);
      }
      set(controller, 'modelParams', modelParams);
      this._super(...arguments);
    },

    actions: {
      /**
       * The special action handler, which detects when an action
       * has reached to the parent of a given child and invokes the
       * callback.
       */
      __findParentRouteAndModel(childRoute, context) {
        if (context.lastRoute === childRoute) {
          // the route just before the current one is the target of
          // our search, this means the current route is the parent
          // and it should invoke the callback with the necessary information
          context.callback({
            route: this,
            model: this.modelFor(this.routeName),
          });
          // stop bubbling as we know there is no other match
          return false;
        }
        context.lastRoute = this;
        return true;
      },
    },
  });
}

export default {
  initialize,
  name: 'route-context',
}
