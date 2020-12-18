class RouterException extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.name = 'Router Exception';
  }
}

/**
 *
 * @param {{routes: {path: string, element: HTMLElement, name: string, elementPath: string}[], root: string, entry: HTMLElement, mode: string}}
 */
function Router({ routes, entry, mode }) {
  const ROUTER_NAME_ATTRIBUTE = 'data-router-name';
  const URL_CHANGE_EVENT = 'urlchange';
  let currentRouteEntry = null;

  if (!Array.isArray(routes) || routes.length === 0) {
    throw new RouterException('Invalid routes array provided');
  }

  if (!entry || !(entry instanceof HTMLElement)) {
    throw new RouterException(
      'Invalid entry point for app. Entry point must be a valid HTML element'
    );
  }

  if (!mode) {
    mode = 'hash';
  }

  function inHistoryMode() {
    return mode === 'history';
  }

  function setupListeners() {
    entry.addEventListener(URL_CHANGE_EVENT, handleUrlChange);
    addEventListener('popstate', handlePopState);
  }

  function handleInitialLoad() {
    currentRouteEntry = getCurrentLocationRoute();
    routes
      .filter((route) => route !== currentRouteEntry)
      .forEach((route) => hideElement(route.element));
    showElement(currentRouteEntry.element);
  }

  function handlePopState(evt) {
    evt.preventDefault();
    entry.dispatchEvent(
      new CustomEvent(URL_CHANGE_EVENT, {
        detail: {
          current: getCurrentLocationRoute(),
          previous: currentRouteEntry,
        },
      })
    );

    currentRouteEntry = getCurrentLocationRoute();
  }

  // go through all links and map them to the routes.
  function mapLinksToRoutes() {
    const linksToMap = document.querySelectorAll(`a[${ROUTER_NAME_ATTRIBUTE}]`);

    linksToMap.forEach((linkElement) => {
      const routeName = linkElement.getAttribute(ROUTER_NAME_ATTRIBUTE);
      const routeEntry = routes.find((route) => route.name === routeName);
      if (!routeEntry) {
        throw new RouterException(`No route found with name: "${routeName}"`);
      }

      linkElement.href = getRouteHref(routeEntry);

      linkElement.addEventListener('click', (e) => {
        e.preventDefault();
        handleLinkClick(linkElement, routeEntry);
      });
    });
  }

  function handleLinkClick(linkElement, routeEntry) {
    pushState(routeEntry, linkElement.href);
  }

  // Consider the current mode (history or hash).
  function getRouteHref(routeEntry) {
    if (inHistoryMode()) {
      return routeEntry.path;
    }

    return `#${routeEntry.path.substring(1)}`;
  }

  function pushState(routeEntry, url) {
    const previousRouteEntry = getCurrentLocationRoute();
    if (previousRouteEntry === routeEntry) {
      // User clicked on a URL to the current location.
      return;
    }
    entry.dispatchEvent(
      new CustomEvent(URL_CHANGE_EVENT, {
        detail: {
          current: routeEntry,
          previous: previousRouteEntry,
        },
      })
    );
    currentRouteEntry = routeEntry;
    history.pushState({}, routeEntry.name, url);
  }

  function handleUrlChange(evt) {
    showElement(evt.detail.current.element);
    const previouslyRenderedElement = evt.detail.previous.element;
    if (previouslyRenderedElement) {
      hideElement(previouslyRenderedElement);
    }
  }

  /**
   *
   * @param {HTMLElement} element
   */
  function showElement(element) {
    entry.appendChild(element);
  }

  /**
   *
   * @param {HTMLElement} element
   */
  function hideElement(element) {
    entry.removeChild(element);
  }

  function getCurrentPath() {
    if (inHistoryMode()) {
      return location.pathname;
    }
    return location.hash || '#';
  }

  /**
   *
   * @param {string} path
   */
  function getRouteEntryFromPath(path) {
    if (path.startsWith('#')) {
      path = `/${path.substring(1)}`;
    }
    return routes.find((route) => route.path === path);
  }

  function getCurrentLocationRoute() {
    return getRouteEntryFromPath(getCurrentPath());
  }

  handleInitialLoad();
  mapLinksToRoutes();
  setupListeners();

  /**
   * Go to a specific named route.
   * @param {string} name - Name of the route to visit.
   */
  this.visit = function (routeName) {
    const route = routes.find(({ name }) => name === routeName);
    if (!route) {
      throw new RouterException(
        `Unable to find route with name: '${routeName}'`
      );
    }

    pushState(route, getRouteHref(route));
  };

  /**
   * Go back one step in the route history.
   */
  this.back = function () {
    history.back();
  };

  /**
   * Go to a specific point in history.
   * @param {Number} number
   */
  this.go = function (number) {
    const validatedNumber = Number(number);
    if (Number.isNaN(validatedNumber)) {
      throw new RouterException(
        `Parameter passed must be a number, ${typeof number} received.`
      );
    }
    history.go(validatedNumber);
  };
}
