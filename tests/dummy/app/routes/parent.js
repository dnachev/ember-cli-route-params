import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
   return {
      parentId: params.id,
      parentEntity: {
        id: params.id,
      },
    };
  },

  getChildRouteParams(childRouteName, model, params) {
    return {
      parentId: model.parentId || params.id,
      parentEntity: model.parentEntity,
    };
  },

  actions: {
    refresh() {
      this.refresh();
    }
  }
});
