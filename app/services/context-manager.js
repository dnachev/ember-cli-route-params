import Service from '@ember/service';
import { assert } from '@ember/debug';
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
  init() {
    this.contextStack = [];
  },

  addRoute(route, model) {
    for (let i = 0; i < this.contextStack.length; i++) {
      if (this.contextStack[i].route != route) {
        continue;
      }
      // found the route, kill the rest of the stack
      this.contextStack = this.contextStack.slice(0, i);
      break;
    }
    this.contextStack.push({
      route,
      model,
    });
  },

  validateRouteCleanup() {
    // TODO This can be used to validate whether the stack has been correctly managed
  },

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
    // TODO This is the simplest logic to determine the route model, although it is not very official
    const modelParams = parentRoute.getChildModelParams(childRouteName, parentModel);
    validateParams(route.routeName, Object.keys(modelParams), paramNames);
    return filterParams(modelParams, paramNames);
  },

  /**
   * Find the parent route in the current stack or the last route
   * if the getRouteModelParams() has been called before the `afterModel` function
   * of the child route has been called.
   */
  _findRouteParentAndModel(childRoute) {
    let parentRouteAndModel = null;
    for (let i = 0; i < this.contextStack.length; i++) {
      if (this.contextStack[i].route === childRoute) {
        break;
      }
      parentRouteAndModel = this.contextStack[i];
    }
    return parentRouteAndModel;
  },

});
