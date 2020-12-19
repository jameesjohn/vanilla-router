const router = new Router({
  routes: [
    { path: '/', elementPath: '/homeComponent.html', name: 'home' },
    { path: '/about', elementPath: '/aboutComponent.html', name: 'about' },
  ],
  entry: document.querySelector('main'),
  mode: 'history',
  rootUrl: 'examples/multi_file_components/',
});
