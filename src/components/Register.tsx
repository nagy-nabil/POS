import { useFormik, Formik, Field, ErrorMessage, Form } from "formik";
import * as yup from 'yup';
interface Person  {
    email: string;
    firstName: string;
    lastName: string
}
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

const validationSchema = yup.object({
                firstName: yup.string()
                .max(15)
                .required(),
                lastName: yup.string()
                .max(20, 'Must be 20 characters or less')
                .required('Required'),
                email: yup.string().email('Invalid email address')
                .required('Required'),
            })
const Register: React.FC<{}> = () => {
    return (
        <Formik<Person> 
        initialValues={{email:'', firstName:'', lastName:''}} 
        onSubmit={(values, {setSubmitting, }) => {
            console.log(JSON.stringify(values, null, 2));
            setSubmitting(false);
        }} 
        validationSchema={validationSchema}>
            <Form>
            <label htmlFor="firstName">firstName</label>
            <Field name="firstName" type="text" />
            <ErrorMessage name="firstName" />

            <label htmlFor="lastName">lastName</label>
            <Field name="lastName" type="text" />
            <ErrorMessage name="firstName" />

            <label htmlFor="email">email</label>
            <Field name="email" type="email" />
            <ErrorMessage name="firstName" />

            <button type="submit">submit</button>
            </Form>
        </Formik>
    );
}
export default Register;
