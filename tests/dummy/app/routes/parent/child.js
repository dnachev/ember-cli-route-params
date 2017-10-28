import Route from '@ember/routing/route';

export default Route.extend({
  routeParams: [
    'parentId',
    'parentEntity',
  ],

  model(params) {
    const modelParams = this.getRouteParams('parentId', 'parentEntity');
    const childProps = {
      childName: params.name,
    };
    return {
      ...modelParams,
      ...childProps,
    };
  }
});
