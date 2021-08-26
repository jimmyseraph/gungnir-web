import Mock from 'mockjs';
import apiInfo from '../config/ApiConfig';

export const getFileCoverageMock = Mock.mock(new RegExp("/api/project/\\w+/file_detail"), apiInfo.getFileCoverage.method, (option: any) => {
    return({
        code: 1000,
        message: 'success',
        data: coverageData,
    });
});

const coverageData = {
    name: 'DemoFile.java',
    lineCount: 25,
    lineCoveredCount: 15,
    branchCount: 15,
    branchCoveredCount: 12,
    instructionCount: 90,
    instructionCoveredCount: 66,
    lines: [
        {
            lineNo: 1,
            content: 'package vip.testops.standup.controllers;',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 2,
            content: '',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 3,
            content: 'import lombok.extern.slf4j.Slf4j;',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 4,
            content: 'import org.springframework.beans.factory.annotation.Autowired;',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 5,
            content: '',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 6,
            content: 'public class AccountController {',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 3,
            instructionCoveredCount: 3,
        },
        {
            lineNo: 7,
            content: '    private AccountService accountService;',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 8,
            content: '',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 9,
            content: '    public Response<LoginVTO<User, String>> login(@RequestBody LoginRequest loginRequest){',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 10,
            content: '        Response<LoginVTO> response = new Response<>();',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 4,
            instructionCoveredCount: 4,
        },
        {
            lineNo: 11,
            content: '        if(StringUtil.isEmptyOrNull(loginRequest.getEmail())){',
            branchCount: 2,
            branchCoveredCount: 1,
            instructionCount: 5,
            instructionCoveredCount: 5,
        },
        {
            lineNo: 12,
            content: '            response.paramMissError("email");',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 3,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 13,
            content: '            return response;',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 2,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 14,
            content: '        }',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 15,
            content: '        accountService.doLogin(loginRequest.getEmail(), loginRequest.getPassword(), response);',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 7,
            instructionCoveredCount: 7,
        },
        {
            lineNo: 16,
            content: '        return response;',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 2,
            instructionCoveredCount: 2,
        },
        {
            lineNo: 17,
            content: '    }',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
        {
            lineNo: 18,
            content: '}',
            branchCount: 0,
            branchCoveredCount: 0,
            instructionCount: 0,
            instructionCoveredCount: 0,
        },
    ],
}