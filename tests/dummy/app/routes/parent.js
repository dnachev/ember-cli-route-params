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

  getChildModelParams(childRouteName, model) {
    return {
      parentId: model.parentId,
      parentEntity: model.parentEntity,
    };
  },

  actions: {
    refresh() {
      this.refresh();
    }
  }
});
