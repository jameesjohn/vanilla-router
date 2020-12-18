const router = new Router({
  routes: [
    { path: '/', element: document.querySelector('#first'), name: 'first' },
    {
      path: '/second',
      element: document.querySelector('#second'),
      // elementPath: "/second.html",
      name: 'second',
    },
    {
      path: '/third',
      element: document.querySelector('#third'),
      name: 'third',
    },
    // {
    //   path: "/fourth",
    //   element: document.querySelector("#fourth"),
    //   name: "fourth",
    // },
    // {
    //   path: "/fifth",
    //   element: document.querySelector("#fifth"),
    //   name: "fifth",
    // },
    // {
    //   path: "/sixth",
    //   element: document.querySelector("#sixth"),
    //   name: "sixth",
    // },
  ],
  entry: document.querySelector('main'),
});
