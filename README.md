# Vanilla Router

This is a simple router that can be used in vanilla javascript projects. If you are building a simple website without frameworks and you want to get SPA (Single Page Application) routing similar to what is available in Vue or React, you'd probably want to check this out.

## Usage

The router is initialized by creating a new Router object.

```javascript
const router = new Router({
  routes: [
    { path: '/', elementPath: '/homeComponent.html', name: 'home' },
    { path: '/about', elementPath: '/aboutComponent.html', name: 'about' },
  ],
  entry: document.querySelector('main'),
  mode: 'history',
  rootUrl: 'examples/multi_file_components/',
});
```

And in your HTML, you can create links to each page using the data-router attributes.

```html
<a href="" data-router-name="first">First Page</a>
<a href="" data-router-name="second">Second Page</a>
<a href="" data-router-name="third">Third Page</a>
```

## Config Object

When instantiating the router class, you are required to provide a configuration object.
The object must contain the following properties.

1. routes - This is an array of routes to be parsed by the router.
2. entry - The entry point of the router. This is where all the routed components would be mounted.
3. mode - History or hash. Specifies if the url should be hashed or not. Defaults to hash.
4. rootUrl - The base URL for the page. Defaults to the page origin if not specified.

### Defining Routes

Routes are perhaps the most important piece of the config object.

Each route requires the following properties.

- path: Path specifies the URL for the route entry. This property is required as we would not be able to modify the URL without it.
- element: Element is a reference to the element to be routed. This property is not required and should only be used if the components to be routed are contained in one page as opposed to single HTML files.
- elementPath: This property is used when components are single filed. It specifies the location of the component with relative to the rootURL.
- name: This property is used to name the routes. It is required and is also used in the HTML when specifying route links.

## Examples

Examples can be found in the `/examples` directory.

## Contributing

The router code can be found in `/src/router.js`.

I'm hoping to convert it to typescript in the near future, and add a build step so it can be published to NPM and available to the world!
