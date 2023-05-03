const Login: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col content-between justify-items-center p-12 align-middle dark:bg-gray-800 dark:text-slate-300">
      <h1 className="text-center text-4xl font-bold ">Zagy POS</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("submit");
        }}
      >
        <label htmlFor="userName" className="text-lg">
          UserName
          <input
            name="userName"
            type="text"
            className="border bg-gray-100 p-2 text-lg text-opacity-80"
          />
        </label>

        <label htmlFor="password" className="text-lg">
          password
          <input
            name="password"
            type="password"
            className="border bg-gray-100 p-2 text-lg text-opacity-80"
          />
        </label>

        <button
          type="submit"
          className=" m-4 mx-auto w-2/5 bg-slate-500 p-2 text-lg text-cyan-50"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
