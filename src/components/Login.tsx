import axios, { AxiosError, AxiosResponse } from 'axios';
import { Formik, Form, Field, ErrorMessage} from 'formik';
import { Link } from 'react-router-dom';
import swal from 'sweetalert';
import { LoginSchema } from '../types/formsSchema';
import { storeLocal } from '../utils/localStorage';
const submitHandler = async (values: LoginSchema) => {
    console.log(values);
    try {
        // TODO for now sendig request as username BUT WHEN FIX IT IN THE API MUST FIX IT HERE
        const res = await axios.post<unknown, AxiosResponse<{result: string; message: string; token: string}, unknown>, LoginSchema & {username: string}>(`${process.env.REACT_APP_API_URL}/login`, {...values, username: values.userName});
        storeLocal('TOKEN', res.data.token);
        swal('Success!', res.data.message, 'success');
    } catch(e) {
        swal("Error!", (e as AxiosError<{message: string}>).response?.data.message as string, "error");
    }
}
// TODO REDIRECT USER TO HOME PAGE AFTER SIGN IN
const Login: React.FC<{}> = () => {
    return (
        <div className='flex flex-col justify-items-center align-middle content-between p-12 w-full h-screen dark:bg-gray-800 dark:text-slate-300'>
        <h1 className='text-center text-4xl font-bold '>Zagy <sub>af</sub> POS
        </h1>
        <Formik<LoginSchema> 
        initialValues={{password: '', userName: ''}} 
        onSubmit={(values, {setSubmitting}) => {
            submitHandler(values);
            setSubmitting(false);
        }}
        >
            <Form className='flex flex-col w-11/12 md:w-2/5 lg:w-1/3 m-auto mt-10 border-2 gap-y-3 p-4 shadow-lg dark:bg-slate-700 dark:shadow-gray-700 dark:border-cyan-900'>
                <label htmlFor='userName' className='text-lg' >UserName</label>
                <Field name="userName" type="text" className="border p-2 text-lg text-opacity-80 bg-gray-100" />
                <ErrorMessage name='userName' />

                <label htmlFor='password' className='text-lg' >password</label>
                <Field name="password" type="password" className="border p-2 text-lg text-opacity-80 bg-gray-100" />
                <ErrorMessage name='password' />

                <button type='submit' className=' bg-slate-500 text-cyan-50 w-2/5 m-4 mx-auto p-2 text-lg'>Submit</button>

                <Link to='/forget-password' className='text-cyan-600' >Forget Password?</Link>
                <Link to='/sign-up' className='text-cyan-600' >Sign Up instead</Link>
            </Form>
        </Formik>
        </div>
    );
}
export default Login;
