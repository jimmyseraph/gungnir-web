const apiInfo = {

    signIn: {
        path: '/api/user/sign_in',
        method: 'post',
    },

    signUp: {
        path: '/api/user/sign_up',
        method: 'post',
    },

    logout: {
        path: '/api/user/logout',
        method: 'get',
    },

    getProjects: {
        path: '/api/project/list',
        method: 'post',
    },

    addProject: {
        path: '/api/project/add',
        method: 'post',
    },

    modifyProject: {
        path: '/api/project/{id}/modify',
        method: 'post',
    },

    uploadFile: {
        path: '/api/project/{id}/upload',
        method: 'post',
    },

    getResourceFiles: {
        path: '/api/project/{id}/files',
        method: 'get',
    },

    getFileCoverage: {
        path: '/api/project/{id}/file_detail',
        method: 'get',
    },

};

export default apiInfo;