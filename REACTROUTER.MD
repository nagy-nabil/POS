# React Router V6 notes
in the entry point for your app use "BrowserRouter" | "createBrowserRouter" and "Route" to provide routing on the client side

```
import { createBrowserRouter, RouterProvider } from 'react-router-dom;

// this will be router provider for our app
const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },
]);

// THIS WHAT OUR APP WILL RETURN
return (
    <RouterProvider router={router} />
);

```
- the '/' route will be called "root route" will be used to serve as the root layout for the application


## global layout for the app [RootRoute]

- Create 'src/routes' and 'src/routes/root.jsx' => THIS FOLDER WILL SERVE AS THE LAYOUT PROVIDER

- export default the layout from 'root.jsx' for example

- AND MAKE SURE INSTEAD OF USING 'a' TO MOVE INSIDE THE APP ROUTES USE 'Link'

```
//! NOTHING SPECIAL FOR REACT ROUTER ALL REACT

export default function Root() {
  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          <form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
            />
            <div
              id="search-spinner"
              aria-hidden
              hidden={true}
            />
            <div
              className="sr-only"
              aria-live="polite"
            ></div>
          </form>
          <form method="post">
            <button type="submit">New</button>
          </form>
        </div>
        <nav>
          <ul>
            <li>
              <Link to={`contacts/1`}>Your Name</Link>
            </li>
            <li>
              <Link to={`contacts/2`}>Your Friend</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}

```

- impoer "Root" in the main app file and change "element" for the path to change layout

```
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
]);
```

## Handling Not Found Errors

Anytime your app throws an error while rendering, loading data, or performing data mutations, React Router will catch it and render an error screen.

```
//! useRouterError used to catch errors between pages so we're using it here to catch whatever error and show it in the console and then rendring error page
// ! error contain property called "statusText"
import { useRouteError } from "react-router-dom";
export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

```

-  REACT ROUTER ALSO LET YOU DECIDE "errorElement" for the "path"

```
import ErrorPage from "./error-page";
// ! FOCUS ON "errorElement"
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
]);

```

## Route could has children and they will have the same layout

- BUT MUST TELL THE ROOT LAYOUT WHERE TO RENDER THE CHILDRENS => with `<Outlet>`  just put Outlet where you need the children be in the layout

```
// ! FOCUS ON "children" which is array of routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "contacts/:contactId",
        element: <Contact />,
      },
    ],
  },
]);

```
