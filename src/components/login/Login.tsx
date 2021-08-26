import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import * as Yup from 'yup';
import { FormikProvider, useFormik, Form } from 'formik';
import { Box, Typography, Tabs, Tab, Theme, createStyles, makeStyles, TextField, Button } from '@material-ui/core';
import apiInfo from '../../config/ApiConfig';
import Request from '../../utils/Request';
import Logo from '../../gungnir.png';
import './Login.css';
import { useTheme } from '@material-ui/core';
import { allowSignUp } from '../../Config';

const useTabStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: '#00BFFF',
            color: 'white',
            marginLeft: 2,
        },
    })
);

interface SignInProps {
    email: string,
    password: string,
}

function SignIn(props: SignInProps) {
    const formvalidationSchema = Yup.object().shape({
        email: Yup.string().required('Email is required'),
        password: Yup.string().required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            email: props.email,
            password: props.password,
        },
        validationSchema: formvalidationSchema,
        enableReinitialize: true,
        onSubmit: values => { 
            Request({
                url: apiInfo.signIn.path,
                method: 'post',
                data: values,
            }, (res) => {
                localStorage.setItem("name", res.data.data.name);
                localStorage.setItem("email", res.data.data.email);
                localStorage.setItem("token", res.data.data.token);
                window.location.href="/";
            });
        },
    });

    const { errors, touched, handleSubmit, getFieldProps } = formik;

    return (
        <FormikProvider value={formik} >
            <Form autoComplete="off" noValidate onSubmit={handleSubmit} style={{margin: 20}}>
                <TextField
                    fullWidth
                    id='email'
                    label='Email'
                    required
                    {...getFieldProps('email')}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                />
                <TextField
                    fullWidth
                    id='password'
                    label='Password'
                    required
                    {...getFieldProps('password')}
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                />
                <Button color="primary" variant="contained" type="submit" style={{marginTop: 20, marginBottom: 20,}}>
                    Submit
                </Button>
            </Form>
        </FormikProvider>
    );
}

function SignUp() {
    const formvalidationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string().required('Email is required'),
        password: Yup.string().required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
        },
        validationSchema: formvalidationSchema,
        enableReinitialize: true,
        onSubmit: values => {
            Request({
                url: apiInfo.signUp.path,
                method: 'post',
                data: values,
            }, (res) => {
                localStorage.setItem("name", res.data.data.name);
                localStorage.setItem("email", res.data.data.email);
                localStorage.setItem("token", res.data.data.token);
                window.location.href="/";
            });
        },
    });

    const { errors, touched, handleSubmit, getFieldProps } = formik;

    return (
        <FormikProvider value={formik} >
            <Form autoComplete="off" noValidate onSubmit={handleSubmit} style={{margin: 20}}>
                <TextField
                    fullWidth
                    id='name'
                    label='Name'
                    required
                    {...getFieldProps('name')}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                />
                <TextField
                    fullWidth
                    id='email'
                    label='Email'
                    required
                    {...getFieldProps('email')}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                />
                <TextField
                    fullWidth
                    id='password'
                    label='Password'
                    required
                    {...getFieldProps('password')}
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                />
                <Button color="primary" variant="contained" type="submit" style={{marginTop: 20, marginBottom: 20,}}>
                    Submit
                </Button>
            </Form>
        </FormikProvider>
    );
}

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function Login() {

    const classes = useTabStyles();
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index: number) => {
        setValue(index);
    };

    return (
        <div className='login-page'>
            <div className="login-logo">
                <img src={Logo} alt='Gungnir' />
            </div>
            <div className='login-card-layout'>
                <SwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={value}
                    onChangeIndex={handleChangeIndex}
                    className="login-card"
                >
                    <TabPanel value={value} index={0} dir={theme.direction}>
                        <SignIn email='' password='' />
                    </TabPanel>
                    <TabPanel value={value} index={1} dir={theme.direction}>
                        <SignUp />
                    </TabPanel>
                </SwipeableViews>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                // textColor='primary'
                >
                    <Tab label="Sign In" id='full-width-tab-0' className={classes.root} />
                    <Tab label="Sign Up" id='full-width-tab-1' className={classes.root} disabled={!allowSignUp} />
                </Tabs>

            </div>
        </div>
    );
}

export default Login;
