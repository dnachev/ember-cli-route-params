import { default as Service, inject } from '@ember/service';
import { get } from '@ember/object';

function getChildRouteName(childRoute, parentRoute) {
  const parentRouteName = parentRoute.routeName;
  let childRouteName = childRoute.routeName;
  if (childRouteName.startsWith(parentRouteName)) {
    // the parent is a prefix of the child - remove it before determining the route name
    childRouteName = childRouteName.substring(parentRouteName.length + 1);
  }
  return childRouteName.split('.', 1)[0];
}

function validateParams(childRouteName, actual, expected) {
  const missing = [];

  for (let i = 0; i < expected.length; i++) {
    if (actual.indexOf(expected[i]) === -1) {
      missing.push(expected[i]);
    }
  }

  if (missing.length > 0) {
    return `Child route ${childRouteName} requires ${missing.join(',')} model parameters, but only ${actual.join(',')} were provided by the parent`;
  }
}

function filterParams(model, names) {
  const filtered = Object.create(null);
  for (let i = 0; i < names.length; i++) {
    // Don't use Ember's get on purpose as no computed property should be passed as part of the model
    filtered[names[i]] = model[names[i]];
  }
  return filtered;
}

export default Service.extend({
  routing: inject('-routing'),

  getRouteModelParams(route, paramNames) {
    const parentRouteAndModel = this._findRouteParentAndModel(route);
    if (!parentRouteAndModel) {
      throw new Error('Cannot get model params for the top application route');
    }
    const {
      route: parentRoute,
      model: parentModel,
    } = parentRouteAndModel;

    const childRouteName = getChildRouteName(route, parentRoute);
    const modelParams = parentRoute.getChildModelParams(childRouteName, parentModel);
    validateParams(route.routeName, Object.keys(modelParams), paramNames);
    return filterParams(modelParams, paramNames);
  },

  /**
   * This is the essence of the library, which peeks into the private API of the router library
   * to be able to determine the parent route and associated model.
   *
   * It does this by triggering an event in the current route hierarchy (the active transition
   * or the current router state) and let the event bubble to the parent route of the passed
   * in child. When the event reaches the parent route, a callback is invoked with the required
   * information.
   *
   * This requires all routes to implement the special event `__findParentRouteAndModel` to be
   * able to correctly handle the bubbling of the event and providing the data.
   */
  _findRouteParentAndModel(childRoute) {
    const router = get(this, 'routing.router');
    const routeHierarchy = router._routerMicrolib.activeTransition || router;
    let routeAndModel = null;
    const context = {
      lastRoute: null,
      callback: (result) => {
        routeAndModel = result;
      },
    };
    routeHierarchy.trigger('__findParentRouteAndModel', childRoute, context);
    if (!routeAndModel) {
      throw new Error(`Cannot find a parent for route ${childRoute.routeName}`);
    }
    return routeAndModel;
  },
});
