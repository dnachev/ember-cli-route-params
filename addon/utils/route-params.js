import { get } from '@ember/object';
import { getOwner } from '@ember/application';

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
function _findRouteParentAndModel(routing, childRoute) {
  const router = get(routing, 'router');
  const routeHierarchy = router._routerMicrolib.activeTransition || router;
  const handlerInfos = routeHierarchy.state.handlerInfos;
  let parentRoute;
  for (let i = 0; i < handlerInfos.length; i++) {
    if (handlerInfos[i]._handler !== childRoute) {
      continue;
    }
    parentRoute = handlerInfos[i - 1]._handler;
    break;
  }
  if (!parentRoute) {
    throw new Error(`Cannot find a parent for route ${childRoute.routeName}`);
  }
  const parentModel = parentRoute.modelFor(parentRoute.routeName);
  const parentParams = parentRoute.paramsFor(parentRoute.routeName);
  return {
    parentRoute,
    parentModel,
    parentParams,
  };
}

export function getRouteParams(route, paramNames) {
  const routing = getOwner(route).lookup('service:-routing');

  const {
    parentRoute,
    parentModel,
    parentParams,
  } = _findRouteParentAndModel(routing, route);

  const childRouteName = getChildRouteName(route, parentRoute);

  const modelParams = parentRoute.getChildRouteParams(childRouteName, parentModel, parentParams);

  validateParams(route.routeName, Object.keys(modelParams), paramNames);
  return filterParams(modelParams, paramNames);
}
