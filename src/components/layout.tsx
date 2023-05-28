const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen">
      <aside
        className="h-screen bg-slate-800 p-4 dark:bg-gray-900 md:w-1/5"
        aria-label="Sidebar"
      >
        <a href={"/"} className="mb-5 flex items-center pl-2.5">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="mr-3 h-6 sm:h-7"
            alt="Flowbite Logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            POS
          </span>
        </a>
        <ul className="space-y-2">
          <li>
            <a
              href={"/branches"}
              className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Branches
            </a>
          </li>
          <li>
            <a
              href={"/anal"}
              className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Analysis
            </a>
          </li>
          <li>
            <a
              href={"/settings"}
              className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Settings
            </a>
          </li>
        </ul>
      </aside>
      {children}
    </div>
  );
};
export default Layout;
