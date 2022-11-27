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
        <Formik<LoginSchema> 
        initialValues={{password: '', userName: ''}} 
        onSubmit={(values, {setSubmitting}) => {
            submitHandler(values);
            setSubmitting(false);
        }}
        >
            <Form>
                <label htmlFor='userName'>UserName</label>
                <Field name="userName" type="text" />
                <ErrorMessage name='userName' />

                <label htmlFor='password'>password</label>
                <Field name="password" type="password" />
                <ErrorMessage name='password' />

                <button type='submit'>Submit</button>

                <Link to='/forget-password'>Forget Password?</Link>
                <Link to='/sign-up'>Sign Up instead</Link>
            </Form>
        </Formik>
    );
}
export default Login;
