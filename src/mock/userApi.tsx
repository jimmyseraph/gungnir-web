import Mock from 'mockjs';
import apiInfo from '../config/ApiConfig';

export const signInMock = Mock.mock(new RegExp(apiInfo.signIn.path), apiInfo.signIn.method, (option: any) => {
    return ({
        code: 1000,
        message: 'success',
        data: {
            name: 'liudao',
            email: 'liudao@163.com',
            token: 'token123456',
        },
    });
});

export const signUpMock = Mock.mock(new RegExp(apiInfo.signUp.path), apiInfo.signUp.method, (option: any) => {
    return ({
        code: 1000,
        message: 'success',
        data: {
            name: 'liudao',
            email: 'liudao@163.com',
            token: 'token123456',
        },
    });
});

export const logoutMock = Mock.mock(new RegExp(apiInfo.logout.path), apiInfo.logout.method, (option: any) => {
    return ({
        code: 1000,
        message: 'success',
    });
});