import { Button, Drawer, Paper, SvgIconProps, Typography } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { TreeView, TreeItem, TreeItemProps } from '@material-ui/lab';
import {
    Code as CodeIcon, Folder as FolderIcon, InsertDriveFile as FileIcon, Help as UnknownIcon,
    ArrowDropDown as ArrowDropDownIcon, ArrowRight as ArrowRightIcon
} from '@material-ui/icons';
import React from 'react';
import apiInfo from '../../config/ApiConfig';
import Request from '../../utils/Request';
import "./Coverage.css";
import { Pretty, Line } from '../prettify/prettify';

declare module 'csstype' {
    interface Properties {
        '--tree-view-color'?: string;
        '--tree-view-bg-color'?: string;
    }
};

const useTreeItemStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            color: theme.palette.text.secondary,
            '&:hover > $content': {
                backgroundColor: theme.palette.action.hover,
            },
            '&:focus > $content, &$selected > $content': {
                backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
                color: 'var(--tree-view-color)',
            },
            '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
                backgroundColor: 'transparent',
            },
        },
        content: {
            color: theme.palette.text.secondary,
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            paddingRight: theme.spacing(1),
            fontWeight: theme.typography.fontWeightMedium,
            '$expanded > &': {
                fontWeight: theme.typography.fontWeightRegular,
            },
        },
        group: {
            marginLeft: 0,
            // '& $content': {
            //     paddingLeft: theme.spacing(2),
            // },
        },
        expanded: {},
        selected: {},
        label: {
            fontWeight: 'inherit',
            color: 'inherit',
        },
        labelRoot: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0.5, 0),
        },
        labelIcon: {
            marginRight: theme.spacing(1),
        },
        labelText: {
            fontWeight: 'inherit',
            flexGrow: 1,
        },
        labelCoverage: {
            marginLeft: 20,
            marginRight: 5,
            fontSize: 10,
            '&.good': {
                color: 'green',
            },
            '&.everage': {
                color: 'inherit',
            },
            '&.bad': {
                color: 'red',
            },
        },
    }),
);

type StyledTreeItemProps = TreeItemProps & {
    bgColor?: string;
    color?: string;
    labelIcon: React.ElementType<SvgIconProps>;
    labelInfo?: string;
    labelText: string;
    labelCoverage?: string;
};

function StyledTreeItem(props: StyledTreeItemProps) {
    const classes = useTreeItemStyles();
    const { labelText, labelCoverage, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props;

    let coverageClass: string = classes.labelCoverage;
    let coverage: number = parseFloat(labelCoverage ? labelCoverage : '0');
    if(coverage < 50) {
        coverageClass = coverageClass + " bad";
    } else if (coverage >= 50 && coverage < 80) {
        coverageClass = coverageClass + " everage";
    } else {
        coverageClass = coverageClass + " good";
    }

    return (
        <TreeItem
            label={
                <div className={classes.labelRoot}>
                    <LabelIcon color="inherit" className={classes.labelIcon} />
                    <Typography variant="body2" className={classes.labelText}>
                        {labelText}
                        <Typography variant='inherit' className={coverageClass}>
                            {labelCoverage}
                        </Typography>
                    </Typography>
                    <Typography variant="caption" color="inherit">
                        {labelInfo}
                    </Typography>
                </div>
            }
            style={{
                '--tree-view-color': color,
                '--tree-view-bg-color': bgColor,
            }}
            classes={{
                root: classes.root,
                content: classes.content,
                expanded: classes.expanded,
                selected: classes.selected,
                // group: classes.group,
                label: classes.label,
            }}
            {...other}
        />
    );
};

type ResourceFileType = {
    id: string,
    name: string,
    type: string,
    coverage: string,
    package?: string,
    components?: ResourceFileType[],
};

interface FileTreeItemProp {
    resourceFiles: ResourceFileType[],
    handleClick: (packageName: string, filename: string) => any,
};

function FileTreeItem(props: FileTreeItemProp) {

    const { resourceFiles } = props;

    const handleIcon = (type: string) => {
        if (type === 'code') {
            return CodeIcon;
        }
        if (type === 'dir') {
            return FolderIcon;
        }
        if (type === 'file') {
            return FileIcon
        }
        return UnknownIcon;
    };

    const handleClick = (packageName: string, filename: string) => {
        console.log(packageName, filename);
        props.handleClick(packageName, filename);

    };

    return (
        <>
            {resourceFiles.map((item: ResourceFileType, index: number) => (
                item.components ?
                    <StyledTreeItem
                        key={item.id}
                        nodeId={item.id}
                        labelText={item.name}
                        labelCoverage={item.coverage}
                        labelIcon={handleIcon(item.type)}
                    >
                        <FileTreeItem resourceFiles={item.components} handleClick={props.handleClick} />
                    </StyledTreeItem>
                    :
                    <StyledTreeItem
                        key={item.id}
                        nodeId={item.id}
                        labelText={item.name}
                        labelIcon={handleIcon(item.type)}
                        labelCoverage={item.coverage}
                        color="#1a73e8"
                        bgColor="#e8f0fe"
                        onClick={() => handleClick(item.package ? item.package : '', item.name)}
                    />

            ))}
        </>
    );
};

const useStyles = makeStyles(
    createStyles({
        root: {
            height: 264,
            flexGrow: 1,
            maxWidth: 600,
            minWidth: 300,
        },
    }),
);

type CoverageProps = {
    match: any,
};

type FileCoverageDataType = {
    name: string,
    lineCount: number,
    lineCoveredCount: number,
    branchCount: number,
    branchCoveredCount: number,
    instructionCount: number,
    instructionCoveredCount: number,
    lines: {
        lineNo: number,
        content: string,
        branchCount: number,
        branchCoveredCount: number,
        instructionCount: number,
        instructionCoveredCount: number,
    }[],
};

function Coverage(props: CoverageProps) {

    const classes = useStyles();

    const [isShow, setIsShow] = React.useState(false);
    const [resourceFiles, setResourceFiles] = React.useState([]);
    const [toggle, setToggle] = React.useState([]);
    const [selected, setSelected] = React.useState();
    const [fileCoverageData, setFileCoverageData] = React.useState<FileCoverageDataType | null>(null);

    React.useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        let { params } = props.match;
        let projectId: number = parseInt(params.id);
        getFiles(projectId);

        return () => {
            console.log("clean");
            window.removeEventListener('mousemove', handleMouseMove);
            setIsShow(false);
            setResourceFiles([]);
            setFileCoverageData(null);
        }
    }, [props.match]);

    React.useEffect(() => {
        // prettyPrint();
    }, [fileCoverageData])

    const handleMouseMove = (event: any) => {
        if (event.pageX < 10) {
            setIsShow(true);
        }

    };

    const getFiles = (projectId: number) => {
        Request({
            url: apiInfo.getResourceFiles.path,
            method: 'get',
        }, (res) => {
            setResourceFiles(res.data.data);
        }, {
            id: projectId,
        });
    };

    const handleChooseFile = (packageName: string, filename: string) => {
        let { params } = props.match;
        let projectId: number = parseInt(params.id);
        getFileCoverage(projectId, packageName, filename);
    }

    const getFileCoverage = (projectId: number, packageName: string, filename: string) => {
        Request({
            url: apiInfo.getFileCoverage.path,
            method: 'get',
            params: {
                package: packageName,
                file: filename,
            },
        }, (res) => {
            setFileCoverageData(res.data.data);
        }, {
            id: projectId,
        });
    };

    const toggleDrawer = (isShow: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setIsShow(isShow);
    };

    const handleNodeToggle = (event: any, value: any) => {
        setToggle(value);
    };

    const handleNodeSelected = (event: any, value: any) => {
        setSelected(value);
    }

    const handleBack = () => {
        window.location.href = '/#/dashboard';
    }

    return (
        <div>
            <Drawer anchor='left' open={isShow} onClose={toggleDrawer(false)}>
                <TreeView
                    className={classes.root}
                    defaultCollapseIcon={<ArrowDropDownIcon />}
                    defaultExpandIcon={<ArrowRightIcon />}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                    onNodeToggle={handleNodeToggle}
                    onNodeSelect={handleNodeSelected}
                    expanded={toggle}
                    selected={selected ? selected : ""}
                >
                    <FileTreeItem resourceFiles={resourceFiles} handleClick={handleChooseFile} />
                </TreeView>
            </Drawer>
            <div style={{ textAlign: 'right', margin: '10px', }}>
                <Button variant="contained" color="primary" onClick={handleBack}>Back</Button>
            </div>
            <Typography variant="h4" component="h4" color='textPrimary' style={{ margin: '10px', }}>
                {
                    fileCoverageData ? fileCoverageData.name : ''
                }
            </Typography>
            <Paper style={{ margin: '10px', }} >
                {
                    fileCoverageData !== null ?

                        <Pretty lang="java" >
                            {
                                fileCoverageData.lines.map(item => {
                                    let appendix: {
                                        title: string,
                                        classValue: string,
                                    } = {
                                        title: '',
                                        classValue: '',
                                    };
                                    if (item.instructionCount === 0) {
                                        appendix = {
                                            title: '',
                                            classValue: '',
                                        };
                                    } else if (item.branchCount === 0) {
                                        if (item.instructionCoveredCount < item.instructionCount) {
                                            appendix.classValue = 'nc';
                                        } else {
                                            appendix.classValue = 'fc';
                                        }
                                    } else {
                                        if (item.branchCoveredCount === 0) {
                                            appendix.title = `All ${item.branchCount} branches missed`;
                                            appendix.classValue = 'nc bnc';
                                        } else if (item.branchCoveredCount < item.branchCount) {
                                            appendix.title = `${item.branchCount - item.branchCoveredCount} of ${item.branchCount} branches missed`;
                                            appendix.classValue = 'pc bpc';
                                        } else {
                                            appendix.title = `All ${item.branchCount} branches covered`;
                                            appendix.classValue = 'fc bfc';
                                        }
                                    }
                                    return (
                                        <Line key={item.lineNo} lineNum={item.lineNo} source={item.content} appendix={appendix} />
                                    );
                                })
                            }
                        </Pretty>
                        :
                        <Typography variant="h3" component="h3" align="center" color='textSecondary'>
                            No Data
                        </Typography>
                }


            </Paper>
        </div>
    );
}

export default Coverage;