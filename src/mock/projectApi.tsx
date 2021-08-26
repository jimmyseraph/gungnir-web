import Mock from 'mockjs';
import apiInfo from '../config/ApiConfig';

const projectData: any[] = [];
for(let i = 1; i <= 32; i++){
    projectData.push({
        projectId: i,
        projectName: `demo project ${i}`,
        repository: `git@gitlab.testops.vip:TestOps/service-${i}.git`,
        branch: 'master',
        jar: 'xx.jar',
        srcDir: 'src/main/java',
        coverage: 78.54,
        creator: 'liudao',
    });
};

export const getProjectsMock = Mock.mock(new RegExp(apiInfo.getProjects.path), apiInfo.getProjects.method, (option: any) => {
    let data = JSON.parse(option.body);
    if(data.current !== undefined && data.pageSize !== undefined){
        let start = (data.current - 1) * data.pageSize;
        let resData: any[] = [];
        projectData.map((item, index: number) => {
            if(index >= start && index < start + data.pageSize){
                resData.push(item);
            }
            return resData;
        });
        return ({
            code: 1000,
            message: 'success',
            data: {
                projects: resData,
                pagination: {
                    current: data.current,
                    pageSize: data.pageSize,
                    total: projectData.length,
                },
            },
        });
    }
    return ({
        code: 1000,
        message: 'success',
        data: { projects: projectData, },
    });
});

export const addProjectMock = Mock.mock(new RegExp(apiInfo.addProject.path), apiInfo.addProject.method, (option: any) => {
    return ({
        code: 1000,
        message: 'success',
    });
});

export const modifyProjectMock = Mock.mock(new RegExp("/api/project/\\w+/modify"), apiInfo.modifyProject.method, (option: any) => {
    return ({
        code: 1000,
        message: 'success',
    });
});

export const uploadFileMock = Mock.mock(new RegExp("/api/project/\\w+/upload"), apiInfo.uploadFile.method, (option: any) => {
    return ({
        code: 1000,
        message: 'success',
    });
});

export const getResourceFilesMock = Mock.mock(new RegExp("/api/project/\\w+/files"), apiInfo.getResourceFiles.method, (option: any) => {
    return ({
        code: 1000,
        message: 'success',
        data: sourceFileData,
    });
});

const sourceFileData = [
    {
        id: 'project',
        name: 'src',
        coverage: '45.5%',
        type: 'dir',
        components: [
            {
                id: 'src.main',
                name: 'main',
                coverage: '45.5%',
                type: 'dir',
                components: [
                    {
                        id: 'src.main.java',
                        name: 'java',
                        coverage: '45.5%',
                        type: 'dir',
                        components: [
                            {
                                id: 'src.main.java.com',
                                name: 'com',
                                coverage: '45.5%',
                                type: 'dir',
                                components: [
                                    {
                                        id: 'src.main.java.com.testops',
                                        name: 'testops',
                                        type: 'dir',
                                        coverage: '45.5%',
                                        components: [
                                            {
                                                id: 'src.main.java.com.testops.vip',
                                                name: 'vip',
                                                coverage: '45.5%',
                                                type: 'dir',
                                                components: [
                                                    {
                                                        id: 'src.main.java.com.testops.vip.demo',
                                                        name: 'demo',
                                                        coverage: '45.5%',
                                                        type: 'dir',
                                                        components: [
                                                            {
                                                                id: 'src.main.java.com.testops.vip.demo.DemoApplication.java',
                                                                package: 'com.testops.vip.demo',
                                                                name: 'DemoApplication.java',
                                                                type: 'code',
                                                                coverage: '45.5%',
                                                            },
                                                            {
                                                                id: 'src.main.java.com.testops.vip.demo.controllers',
                                                                name: 'controllers',
                                                                type: 'dir',
                                                                coverage: '45.5%',
                                                                components: [
                                                                    {
                                                                        id: 'src.main.java.com.testops.vip.demo.controllers.AccountController.java',
                                                                        package: 'com.testops.vip.demo.controllers',
                                                                        name: 'AccountController.java',
                                                                        type: 'code',
                                                                        coverage: '45.5%',
                                                                    },
                                                                    {
                                                                        id: 'src.main.java.com.testops.vip.demo.controllers.OrderController.java',
                                                                        package: 'com.testops.vip.demo.controllers',
                                                                        name: 'OrderController.java',
                                                                        type: 'code',
                                                                        coverage: '66.5%',
                                                                    },
                                                                    {
                                                                        id: 'src.main.java.com.testops.vip.demo.controllers.AdminController.java',
                                                                        package: 'com.testops.vip.demo.controllers',
                                                                        name: 'AdminController.java',
                                                                        type: 'code',
                                                                        coverage: '45.5%',
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                id: 'src.main.java.com.testops.vip.demo.service',
                                                                name: 'services',
                                                                type: 'dir',
                                                                coverage: '45.5%',
                                                                components: [
                                                                    {
                                                                        id: 'src.main.java.com.testops.vip.demo.service.AccountService.java',
                                                                        package: 'com.testops.vip.demo.service',
                                                                        name: 'AccountService.java',
                                                                        type: 'code',
                                                                        coverage: '98.5%',
                                                                    },
                                                                    {
                                                                        id: 'src.main.java.com.testops.vip.demo.service.OrderService.java',
                                                                        package: 'com.testops.vip.demo.service',
                                                                        name: 'OrderService.java',
                                                                        type: 'code',
                                                                        coverage: '45.5%',
                                                                    },
                                                                    {
                                                                        id: 'src.main.java.com.testops.vip.demo.service.AdminService.java',
                                                                        package: 'com.testops.vip.demo.service',
                                                                        name: 'AdminService.java',
                                                                        type: 'code',
                                                                        coverage: '45.5%',
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    // {
                    //     id: 'src.main.resources',
                    //     name: 'resources',
                    //     type: 'dir',
                    //     components: [
                    //         {
                    //             id: 'src.main.resources.application.properties',
                    //             name: 'application.properties',
                    //             type: 'file',
                    //         },
                    //         {
                    //             id: 'src.main.resources.mapping.xml',
                    //             name: 'mapping.xml',
                    //             type: 'file',
                    //         },
                    //     ],
                    // },
                ],
            },
            {
                id: 'src.test',
                name: 'test',
                type: 'dir',
                coverage: '45.5%',
                components: [
                    {
                        id: 'src.test.DemoTest.java',
                        package: '',
                        name: 'DemoTest.java',
                        type: 'code',
                        coverage: '45.5%',
                    },
                ],
            },
        ],
    },
];