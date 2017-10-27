import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('parent', { path: '/parent/:id' }, function() {
    this.route('child', { path: '/:name' });
  });
});

export default Router;
