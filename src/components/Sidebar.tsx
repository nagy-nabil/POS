//This project setup uses webpack for handling all assets. webpack offers a custom way of “extending” the concept of import beyond JavaScript. To express that a JavaScript file depends on a CSS file, you need to import the CSS
// /import './Sidebar.css'
import { Link } from "react-router-dom";
const Sidebar = () => {
   console.log('rend');
   return (
   <aside className="h-screen bg-slate-800 dark:bg-gray-900" aria-label="Sidebar">
         <Link to={"/"} className="flex items-center pl-2.5 mb-5">
            <img src="https://flowbite.com/docs/images/logo.svg" className="mr-3 h-6 sm:h-7" alt="Flowbite Logo" />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
         </Link>
         <ul className="space-y-2">
            <li>
               <Link to={'/sign-up'} className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  sign up
               </Link>
            </li>
         </ul>
   </aside>

   );
}
export default Sidebar;