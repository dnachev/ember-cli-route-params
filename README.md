# ember-cli-route-params

This addon allows the parent to pass additional parameters to its child routes.

## Disclaimer
This hasn't been tested in production or any meaningful application. It is just exploratory project.

## The Idea
Ember Routes can only receive parameters from the URL. Although this limitation allows for very convenient URL management and consistency in handling the browser location, sometimes a route requires more context in which the route operates, which cannot be represented with just a string value from its URL dynamic parameters or that of its parent.

This addon allows a child route to receive these additional parameters from its parent with much cleaner interface than the existing alternatives.

```javascript
import Route from '@ember/routing/route';

const ParentRoute = Route.extend({
  model(params) {
    // return normal route model
  },

  getChildRouteParams(childRouteName, model, params) {
    // return the child route parameters based on the current parent route model and params
  },
});

const ChildRoute = Route.extend({
  model(params) {
    // fetch the route params from its parent
    const routeParams = this.getRouteParams(
      'parentEntity',
      'relatedEntity',
    );
    const childModel = ... // fetch the child model
    return {
      ...routeParams,
      ...childModel,
    };
  }
});
```

The `getRouteParams()` function allows a route to get the parameters, passed in from the parent.
The function can be invoked at any time as long as the parent route has loaded its model.

The `getChildRouteParams()` has full freedom how to construct a child route parameters - it can
pass down the model without changes or it can reshape the data before passing it. It can also get
its own parameters from its parent:

```javascript
Route.extend({
  getChildRouteParams(childRouteName, model, params) {
    const {
      category,
      user
    } = this.getRouteParams('category', 'user');
    return {
      categoryTags: get(category, 'tags'),
      userRole: get(user, 'role')
    };
  }
});
```

Why this is good thing? Read below.

## The Problem
Whenever two Ember routes need to exchange data, it is usually through the `Route.modelFor` function, which forces the route, which uses the data to reach out to the route, which provides the data. Such sharing of data is usually done between parent and child routes, where the parent defines the context in which the child operates. One common pattern when this happens is in a page, which renders a high-level entity with several child routes, each representing different aspects of the high-level entity. It is likely that each child route will require some attribute of the high-level entity.

There are several problems with solving this problem using `Route.modelFor`:

* The child is tightly coupled with the parent as it knows which is its parent route and what is its model shape.
* The parent route no longer controls, who can access its model, which makes it harder to refactor it.
* The parent model might need to put unnecessary data on its model to be able to share it with its child routes.

There are other ways to solve this:
* Use Ember Data store to share application data and rely on `Store.peekRecord` to not fetch data unnecessary. This removes the obvious coupling between the routes, which `Route.modelFor` has, but it replaces it with an implicit coupling, because it expects the parent route to have fetched the data already. Any refactoring of the routes turns into a small nightmare to re-discover, who is supposed to
  actually fetch these records.
* Use a service to share data. This is much better and it is akin to what this addon implements. The biggest downside to this approach is that it requires active maintenance of the state of this services. If the code has been changed, it is easy to introduce stale state if a mandatory function call is left out.
* Other ways? They might be the answer, so I'd love to hear them.

## Installation

* `git clone <repository-url>` this repository
* `cd ember-cli-route-params`
* `yarn`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `yarn test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
