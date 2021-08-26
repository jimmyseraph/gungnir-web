import * as Yup from 'yup';
import { FormikProvider, useFormik, Form, Formik, Field } from 'formik';
import {
    Box, Theme, withStyles, TextField, fade, Button,
    Paper, TableContainer, Table, TableHead, TableRow, TableCell,
    TableBody, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions
} from '@material-ui/core';
import { TextField as TF } from 'formik-material-ui';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import React from 'react';
import apiInfo from '../../config/ApiConfig';
import Request from '../../utils/Request';

const styles = (theme: Theme) => ({
    header: {
        '& .MuiTextField-root': {
            backgroundColor: fade(theme.palette.common.white, 0.15),
            border: 0,
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
                border: 0,
            },
            borderRadius: theme.shape.borderRadius,
            margin: theme.spacing(2),
            width: '30ch',
        },
        '& .MuiInputBase-root': {
            color: theme.palette.common.white,
        },
        '& .MuiTextField-root label': {
            color: theme.palette.common.white,
        },
        '& .MuiButton-root': {
            margin: '16px 40px',

        },
    },
    content: {
        margin: "10px",
        '& .MuiTableContainer-root': {
            minHeight: 600,
        },
    },
    operate: {

        '& .MuiButtonBase-root': {
            margin: theme.spacing(1),
        }
        
    }
});

type dialogRecordType = {
    projectId: number,
    projectName: string,
    repository: string,
    branch: string,
    srcDir: string,
};

interface DialogProp {
    isShow: boolean,
    record: dialogRecordType,
    handleClose: () => any,
};

function ProjectSettingDialog(props: DialogProp) {

    const formvalidationSchema = Yup.object().shape({
        projectName: Yup.string().required('Project name is required'),
        repository: Yup.string().required('Repository is required'),
        branch: Yup.string().required('Branch/Tag name is required'),
        srcDir: Yup.string().required('Source directory is required'),
    });

    const formik = useFormik({
        initialValues: {
            projectName: props.record.projectName,
            repository: props.record.repository,
            branch: props.record.branch,
            srcDir: props.record.srcDir,
        },
        validationSchema: formvalidationSchema,
        enableReinitialize: true,
        onSubmit: values => {
            let payload = {
                projectId: props.record.projectId,
                ...values,
            }
            Request({
                url: payload.projectId === -1 ? apiInfo.addProject.path : apiInfo.modifyProject.path,
                method: 'post',
                data: payload,
            }, (res) => {
                console.log(res);
            });
        },
        
    });

    const handleClose = () => {
        props.handleClose();
    };

    const { errors, touched, handleSubmit, getFieldProps } = formik;

    return (
        <Dialog open={props.isShow} fullWidth aria-labelledby='add-or-update-project'>
            <DialogTitle id="add-or-update-project">Project Setting</DialogTitle>
            <FormikProvider value={formik}>
                <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            id='name'
                            label='Project Name'
                            required
                            {...getFieldProps('projectName')}
                            error={Boolean(touched.projectName && errors.projectName)}
                            helperText={touched.projectName && errors.projectName}
                        />
                        <TextField
                            fullWidth
                            id='repository'
                            label='Repository'
                            required
                            {...getFieldProps('repository')}
                            error={Boolean(touched.repository && errors.repository)}
                            helperText={touched.repository && errors.repository}
                        />
                        <TextField
                            fullWidth
                            id='branch'
                            label='Branch/Tag'
                            required
                            {...getFieldProps('branch')}
                            error={Boolean(touched.branch && errors.branch)}
                            helperText={touched.branch && errors.branch}
                        />
                        <TextField
                            fullWidth
                            id='srcDir'
                            label='Src Dir'
                            required
                            {...getFieldProps('srcDir')}
                            error={Boolean(touched.srcDir && errors.srcDir)}
                            helperText={touched.srcDir && errors.srcDir}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">Cancel</Button>
                        <Button color="primary" type="submit">Submit</Button>
                    </DialogActions>
                </Form>
            </FormikProvider>
        </Dialog>
    );
};

interface DashboardProp {
    classes: any,
};

interface DashboardState {
    projectData: any[],
    total: number,
    pageSize: number,
    current: number,
    isShow: boolean,
    dialogRecord: dialogRecordType,
};

interface Column {
    id: string,
    label: string,
    minWidth?: number,
    align?: 'right';
    format?: (value: any, record?: any) => string | JSX.Element;
}

class Dashboard extends React.Component<DashboardProp, DashboardState> {

    constructor(prop: DashboardProp) {
        super(prop);
        this.state = {
            projectData: [],
            total: 0,
            pageSize: 10,
            current: 1,
            isShow: false,
            dialogRecord: {
                projectId: -1,
                projectName: "",
                repository: "",
                branch: "",
                srcDir: '',
            },
        };
    };

    componentWillUnmount() {
        this.setState = () => {
            return;
        };
    };

    componentDidMount() {
        let payload = {
            pageSize: this.state.pageSize,
            current: this.state.current,
        };
        this.getData(payload);
    };

    getData = (payload?: any) => {
        Request({
            url: apiInfo.getProjects.path,
            method: 'post',
            data: payload,
        }, (res) => {
            this.setState({
                projectData: res.data.data.projects,
                total: res.data.data.pagination.total,
            });
        });
    };

    handleUploadJar = (record: any, event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.files;
        console.log(value);
        let formData = new FormData();
        formData.append("jar", value !== null ? value[0] : "");
        Request({
            // url: apiInfo.uploadFile.path,
            url: "http://localhost:8080/api/project/{id}/upload",
            method: 'post',
            headers: {
                "Content-Type": "multipart/form-data;boundary="+new Date().getTime(),
            },
            data: formData,
        }, (res) => {
            console.log("ok");
        }, {
            id: record.projectId,
        })
    };

    handleEdit = (record: any) => {
        this.setState({
            dialogRecord: {
                projectId: record.projectId,
                projectName: record.projectName,
                repository: record.repository,
                branch: record.branch,
                srcDir: record.srcDir,
            },
            isShow: true,
        });
    };

    handleView = (record: any) => {
        window.location.href = `/#/coverage/${record.projectId}`;
    }

    columns: Column[] = [
        {
            id: 'projectName',
            label: 'Project Name',
        },
        {
            id: 'repository',
            label: 'Repoitory',
        },
        {
            id: 'branch',
            label: 'Branch',
        },
        {
            id: 'jar',
            label: 'Jar',
        },
        {
            id: 'coverage',
            label: 'Coverage(%)',
        },
        {
            id: 'creator',
            label: 'Creator',
        },
        {
            id: 'operate',
            label: 'Operate',
            format: (value: any, record?: any) => {
                const { classes } = this.props;
                return(
                    <div className={classes.operate}>
                        <Button variant='contained' size='small' onClick={() => this.handleEdit(record)} >Edit</Button>
                        <input accept="application/java-archive" style={{display: "none",}} id={`upload-jar-file-${record.projectId}`} type='file' onChange={(event) => this.handleUploadJar(record, event)} />
                        <label htmlFor={`upload-jar-file-${record.projectId}`}>
                            <Button variant='contained' component='span' size='small'>Upload Jar</Button>
                        </label>
                        <Button variant='contained' size='small' onClick={() => this.handleView(record)} >View</Button>
                    </div>
                );
            },
        },
    ];

    handleChangePage = (event: unknown, current: number) => {
        console.log("current: ", current);
        this.setState({
            current: current + 1,
        });
        let payload = {
            pageSize: this.state.pageSize,
            current: current + 1,
        };
        this.getData(payload);
    };

    handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            pageSize: +event.target.value,
            current: 1,
        });
        let payload = {
            pageSize: +event.target.value,
            current: 1,
        };
        this.getData(payload);
    };

    handleAddProject = () => {
        this.setState({
            isShow: true,
            dialogRecord: {
                projectId: -1,
                projectName: "",
                repository: "",
                branch: "",
                srcDir: '',
            }
        });
    };

    handleClose = () => {
        this.setState({
            isShow: false,
        });
        let payload = {
            pageSize: this.state.pageSize,
            current: this.state.current,
        };
        this.getData(payload);
    };

    render() {
        const { classes } = this.props;
        return (
            <>
                <Box p={12} boxShadow={3} borderRadius="borderRadius" color="white" bgcolor="primary.main" style={{ margin: "10px", padding: 30, }}>
                    <Formik
                        initialValues={{
                            keyword: '',
                        }}
                        onSubmit={(values: any, { setSubmitting }) => {
                            let payload = {
                                keyword: values.keyword,
                                pageSize: this.state.pageSize,
                                current: this.state.current,
                            };
                            Request({
                                url: apiInfo.getProjects.path,
                                method: 'post',
                                data: payload,
                            }, (res) => {
                                this.setState({
                                    projectData: res.data.data.projects,
                                    total: res.data.data.pagination.total,
                                });
                                setSubmitting(false);
                            });
                        }}
                    >
                        {({ submitForm, isSubmitting }) => (
                            <Form className={classes.header}>
                                <Field component={TF} name='keyword' variant='outlined' size='small' label='Keyword' />
                                <Button variant='contained' onClick={submitForm} disabled={isSubmitting} >Search</Button>
                            </Form>
                        )}
                    </Formik>
                </Box>
                <div style={{ textAlign: 'right', margin: '10px', }}>
                    <Button variant="contained" color="primary" onClick={this.handleAddProject} startIcon={<LibraryAddIcon />}>Add</Button>
                </div>

                <Paper className={classes.content}>
                    <TableContainer>
                        <Table stickyHeader aria-label='Coverage List'>
                            <TableHead>
                                <TableRow>
                                    {this.columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.projectData.map((item) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={item.projectId}>
                                            {this.columns.map((column) => {
                                                const value = item[column.id];
                                                return (
                                                    <TableCell key={column.id}>
                                                        {column.format ? column.format(value, item) : value}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 15, 25]}
                        component="div"
                        count={this.state.total}
                        rowsPerPage={this.state.pageSize}
                        page={this.state.current - 1}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                </Paper>
                <ProjectSettingDialog
                    isShow={this.state.isShow}
                    handleClose={this.handleClose}
                    record={this.state.dialogRecord}
                />
            </>
        );
    }
}

export default withStyles(styles)(Dashboard);