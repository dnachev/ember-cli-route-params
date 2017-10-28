import Route from '@ember/routing/route';

export default Route.extend({
  routeModelParams: [
    'parentId',
    'parentEntity',
  ],

  model(params) {
    const modelParams = this.getRouteModelParams('parentId', 'parentEntity');
    const childProps = {
      childName: params.name,
    };
    return {
      ...modelParams,
      ...childProps,
    };
  }
});
