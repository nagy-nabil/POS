import { Formik, Field, ErrorMessage, Form } from "formik";
import {object, ref, SchemaOf, string} from 'yup';
import { UserData } from '../types/entities';
import axios, { AxiosError } from "axios";
import swal from 'sweetalert';
// const Register: React.FC<{}> = () => {
//     // minimum for formik is initialValues and onSubmit
//     const formik = useFormik<Person>({
//         initialValues: {
//             email: '',
//             firstName: '',
//             lastName: ''
//         },
//         onSubmit: (values) => {
//             alert(JSON.stringify(values, null, 2));
//         },
//         validationSchema: yup.object({
//             firstName: yup.string()
//             .max(15)
//             .required(),
//             lastName: yup.string()
//             .max(20, 'Must be 20 characters or less')
//             .required('Required'),
//             email: yup.string().email('Invalid email address')
//             .required('Required'),
//         })
//     });
//     // return (
//     //     <form onSubmit={formik.handleSubmit}>
//     //         <label htmlFor="firstName">firstName</label>
//     //         <input 
//     //             id="firstName"
//     //             name="firstName" 
//     //             type="text" 
//     //             onChange={formik.handleChange} 
//     //             value={formik.values.firstName}
//     //             onBlur={formik.handleBlur}
//     //         ></input>
//     //         {formik.errors.firstName && formik.touched.firstName ? (<div>{formik.errors.firstName}</div>) : null}
//     //         <label htmlFor="lastName">lastName</label>
//     //         <input
//     //             id="lastName" 
//     //             name="lastName" 
//     //             type="text" 
//     //             onChange={formik.handleChange} 
//     //             value={formik.values.lastName}
//     //             onBlur={formik.handleBlur}
//     //         ></input>
//     //         {formik.errors.lastName && formik.touched.lastName ? (<div>{formik.errors.lastName}</div>) : null}
//     //         <label htmlFor="email">Email</label>
//     //         <input 
//     //             id="email" 
//     //             name="email" 
//     //             type="email" 
//     //             onChange={formik.handleChange} 
//     //             value={formik.values.email}
//     //             onBlur={formik.handleBlur}
//     //         ></input>
//     //         {formik.errors.email && formik.touched.email ? (<div>{formik.errors.email}</div>) : null}
//     //         <button type="submit">Submit</button>
//     //     </form>
//     // );
//     //! THAT WAS AN EXPRESSIVE FOR HOW FORMIK HANDLE FORM BUT FORMIK GIVE US HELPER TO SPREAD ALL THIS PATTERENS IN THE INPUT WITH "formik.getFieldProps('FIELD NAME')"
//     return (
//         <form onSubmit={formik.handleSubmit}>
//             <label htmlFor="firstName">firstName</label>
//             <input 
//                 id="firstName"
//                 type="text" 
//                 {...formik.getFieldProps('firstName')}
//             ></input>
//             {formik.errors.firstName && formik.touched.firstName ? (<div>{formik.errors.firstName}</div>) : null}
//             <label htmlFor="lastName">lastName</label>
//             <input
//                 id="lastName" 
//                 type="text" 
//                 {...formik.getFieldProps('lastName')}            
//             ></input>
//             {formik.errors.lastName && formik.touched.lastName ? (<div>{formik.errors.lastName}</div>) : null}
//             <label htmlFor="email">Email</label>
//             <input 
//                 id="email" 
//                 type="email" 
//                 {...formik.getFieldProps('email')}
//             ></input>
//             {formik.errors.email && formik.touched.email ? (<div>{formik.errors.email}</div>) : null}
//             <button type="submit">Submit</button>
//         </form>
//     );
// }
type SignUpData = UserData & {confirmPassword: string}
const signUpSchema: SchemaOf<SignUpData> = object({
        email: string()
        .email('invaild email')
        .required(),
        password: string()
        .min(4, 'password too short min 4 chars')
        .required('password is required'),
        userName: string()
        .min(2, "username is Too Short!")
        .max(50, "username is Too Long!")
        .required("username is Required"),
        confirmPassword: string()
        .oneOf([ref('password'), null], 'Both password need to be the same')
        .required(),
    })
//TODO redirect user to login page after sign up success
const Register: React.FC<{}> = () => {
    return (
        <Formik<SignUpData>
        initialValues={{email: '', password: '', userName: '', confirmPassword: ''}} 
        onSubmit={async (values, {setSubmitting, }) => {
            console.log(JSON.stringify(values, null, 2));
            setSubmitting(false);
            try {
                const res = await axios.post<any, {data: {result: string, message: string}}>(`${process.env.REACT_APP_API_URL}/register`, {...values, username: values.userName})
                console.log(res.data);
                swal('Success', res.data.message, 'success');
            } catch (e) {
                console.log(`${(e as AxiosError).message} ${JSON.stringify((e as AxiosError).response?.data)}`)
                swal("Error!", (e as AxiosError<{message: string}>).response?.data.message as string, "error");
            }
        }} 
        validationSchema={signUpSchema}
        >
            <Form >
            <label htmlFor="userName">userName</label>
            <Field name="userName" type="text" />
            <ErrorMessage name="userName" />

            <label htmlFor="email">email</label>
            <Field name="email" type="email" />
            <ErrorMessage name="email" />

            <label htmlFor="password">password</label>
            <Field name="password" type="password" />
            <ErrorMessage name="password" />

            <label htmlFor="confirmPassword">confirmPassword</label>
            <Field name="confirmPassword" type="password" />
            <ErrorMessage name="confirmPassword" />

            <button type="submit">submit</button>
            </Form>
        </Formik>
    );
}
export default Register;
