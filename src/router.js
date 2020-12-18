class RouterException extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.name = 'Router Exception';
  }
}

/**
 *
 * @param {{routes: {path: string, element: HTMLElement, name: string, elementPath: string}[], rootUrl: string, entry: HTMLElement, mode: string}}
 */
function Router({ routes, entry, mode, rootUrl = '/' }) {
  // Prune the root URL. Rules: The Root URL should start with a '/' but not end with a '/'.
  if (!rootUrl.startsWith('/')) rootUrl = `/${rootUrl}`;
  if (rootUrl.endsWith('/')) rootUrl = rootUrl.substring(0, rootUrl.length - 1);
  rootUrl = location.origin + rootUrl;

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

  /**
   * Handle initial setup and bootstrapping of the page.
   */
  function handleInitialLoad() {
    currentRouteEntry = getCurrentLocationRoute();
    // Empty the page initially.
    entry.innerHTML = '';

    showElement(currentRouteEntry.element);
  }

  /**
   * Handle native pop state triggered by the browser.
   * @param {PopStateEvent} evt
   */
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

  /**
   * Go through all the links and map them to appropriate routes.
   */
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

  /**
   *
   * @param {HTMLAnchorElement} linkElement
   * @param {{path: string, element: HTMLElement, name: string, elementPath: string}} routeEntry
   */
  function handleLinkClick(linkElement, routeEntry) {
    pushState(routeEntry, linkElement.href);
  }

  /**
   * Get the href property for the route entry.
   * @param {{path: string, element: HTMLElement, name: string, elementPath: string}} routeEntry
   */
  function getRouteHref(routeEntry) {
    if (inHistoryMode()) {
      return rootUrl + routeEntry.path;
    }

    return `#${routeEntry.path.substring(1)}`;
  }

  /**
   * Wrapper over history.pushState. This function dispatches the
   * URL_CHANGE_EVENT, and updates the current route entry before
   * calling history.pushState appropriately.
   * @param {{path: string, element: HTMLElement, name: string, elementPath: string}} routeEntry
   * @param {string} url
   */
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

  /**
   * Handle the URL change event. This function displays the next page
   * and hides the page being left.
   * @param {CustomEvent} evt
   */
  function handleUrlChange(evt) {
    showElement(evt.detail.current.element);
    const previouslyRenderedElement = evt.detail.previous.element;
    if (previouslyRenderedElement) {
      hideElement(previouslyRenderedElement);
    }
  }

  /**
   * Show a specific element.
   * @param {HTMLElement} element
   */
  function showElement(element) {
    entry.appendChild(element);
  }

  /**
   * Hide a specific element.
   * @param {HTMLElement} element
   */
  function hideElement(element) {
    entry.removeChild(element);
  }

  /**
   * Get the current route which the user is on.
   */
  function getCurrentPath() {
    if (inHistoryMode()) {
      const currentPathname = location.pathname;
      const rootPathname = new URL(rootUrl).pathname;
      const path = currentPathname.substring(rootPathname.length);
      return path;
    }
    return location.hash || '#';
  }

  /**
   * Get the route associated with a particular path.
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
