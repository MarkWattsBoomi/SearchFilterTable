import { eContentType, FlowDisplayColumn, FlowMessageBox, FlowObjectData, FlowObjectDataProperty, FlowOutcome, modalDialogButton } from 'flow-component-model';
import React from 'react';
import CommonFunctions from './CommonFunctions';
import SearchFilterTable from './SearchFilterTable';
// declare const manywho: IManywho;
declare const manywho: any;

export default class SearchFilterTableRow extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {enabledOutcomes: []};
    }

    async componentDidMount(): Promise<void> {
        const enabledOutcomes: string[] = [];
        const root: SearchFilterTable = this.props.root;
        const objData: FlowObjectData = root.rowMap.get(this.props.id)?.objectData;
        const keys: string[] = Object.keys(root.outcomes);
        for (let pos = 0 ; pos < keys.length ; pos++) {
            if (root.outcomes[keys[pos]].isBulkAction === false) {
                if(!root.supressedOutcomes.has(root.outcomes[keys[pos]].developerName)) {
                    if (await CommonFunctions.assessRowOutcomeRule(root.outcomes[keys[pos]], objData, root) === true) {
                        enabledOutcomes.push(keys[pos]);
                    }
                }
            }
        }
        this.setState({enabledOutcomes});
        root.forceUpdate();
    }

    render() {

        const root: SearchFilterTable = this.props.root;
        const objData: FlowObjectData = root.rowMap.get(this.props.id)?.objectData;

        const buttons: any[] = [];
        let anyoutcomes: boolean = false;
        Object.keys(root.outcomes).forEach((key: string) => {
            if (root.outcomes[key].isBulkAction === false) {
                if(!root.supressedOutcomes.has(key)) {
                    anyoutcomes=true;
                }
                const showOutcome: boolean = this.state.enabledOutcomes.indexOf(key) >= 0;

                if (showOutcome === true) {
                    let icon: any;
                    let label: any;

                    if ((!root.outcomes[key].attributes['display']) || root.outcomes[key].attributes['display'].value.indexOf('text') >= 0) {
                        label = (
                            <span
                                className="sft-table-cell-button-element sft-table-cell-button-label"
                            >
                                {root.outcomes[key].label}
                            </span>
                        );
                    }
                    if ((root.outcomes[key].attributes['display']) && root.outcomes[key].attributes['display'].value.indexOf('icon') >= 0) {
                        icon = (
                            <span
                                className={'sft-table-cell-button-element sft-table-cell-button-icon glyphicon glyphicon-' + (root.outcomes[key].attributes['icon'].value || 'plus')}
                            />
                        );
                    }

                    buttons.push(
                        <div
                            className="sft-table-cell-button"
                            title={root.outcomes[key].label}
                            onClick={(event: any) => {
                                root.doOutcome(key, objData.internalId);
                            }}
                        >
                            {icon}
                            {label}

                        </div>,
                    );
                }
            }
        });

        const cols: any[] = [];

        cols.push(
            <td
                className="sft-table-cell sft-table-cell-check"
            >
                <input
                    className="sft-checkbox"
                    type="checkbox"
                    onClick={(event: any) => {root.toggleSelect(event, this.props.id); }}
                    checked={root.selectedRowMap.has(this.props.id)}
                />
            </td>,
        );

        root.userColumns.forEach((collName: string) => {
            if (collName === '#BUTTONS#') {
                if (anyoutcomes) {
                    cols.push(
                        <td
                            className="sft-table-cell"
                        >
                            <div
                                className="sft-table-cell-buttons"
                            >
                                {buttons}
                            </div>
                        </td>,
                    );
                }
            } else {
                const col: FlowDisplayColumn = root.colMap.get(collName);
                // root.colMap.forEach((col: FlowDisplayColumn) => {
                if (col) {
                const val: any = this.formatValue(col.componentType, col.contentType, root, objData?.properties[col.developerName], objData);

                cols.push(
                        <td
                            className="sft-table-cell"
                        >
                            {val}
                        </td>,
                    );
                } else {
                    console.log('Failed to get a definition for col ' + collName);
                }
            }

        });
        return (
            <tr
                className="sft-table-row"
            >
                {cols}
            </tr>
        );
    }

    // handles special contents like uris & dataUri
    formatValue(componentType: string, contentType: eContentType,  root: SearchFilterTable, value: FlowObjectDataProperty, row: FlowObjectData): any {
        let result: any;
        if (value && value.developerName) {
            if (root.columnRules.has(value.developerName)) {
                result = root.columnRules.get(value.developerName).generateColumnContent(value.value, row, root);
            } else {
                if (componentType?.length > 0) {
                    const columnProps = {
                        id: row.internalId,
                        propertyId: value.typeElementPropertyId,
                        contentValue: value.value,
                        objectData: value.value,
                        flowKey: root.flowKey,
                        contentType: value.contentType,
                        contentFormat: value.contentFormat,
                        row,
                        sft: root,
                    };
                    result = React.createElement(manywho.component.getByName(componentType), columnProps);
                } else {
                    switch (contentType) {
                        case eContentType.ContentDateTime:
                            const dt: Date = new Date(value.value as string);
                            if ((dt instanceof Date && !isNaN(dt.getTime())) === true) {
                                let str: string = '';
                                switch (root.getAttribute('DateFormat', 'LOCALE')) {
                                    case 'UTC':
                                        str = dt.toUTCString();
                                        break;
                                    case 'JSON':
                                        str = dt.toJSON();
                                        break;
                                    default:
                                        str = dt.toLocaleString();
                                        break;
                                }
                                result = (
                                    <span
                                        className="sft-table-cell-text"
                                    >
                                        {str}
                                    </span>
                                );
                            } else {
                                <span className="sft-table-cell-text" />;
                            }
                            break;

                        case eContentType.ContentString:
                            switch (true) {
                                case this.isJSON(value.value as string) === true:
                                    result = (
                                        <button
                                            onClick={(e: any) => {this.showJSON(value.developerName, value.value as string); }}
                                        >
                                            {'View JSON'}
                                        </button>
                                    );
                                    break;

                                case this.isContent(value.value as string) === true:
                                    result = (
                                        <button
                                            onClick={(e: any) => {this.showContent(value.developerName, value.value as string); }}
                                        >
                                            {'View Content'}
                                        </button>
                                    );
                                    break;

                                case (value.value as string).startsWith('http:'):
                                case (value.value as string).startsWith('https:'):
                                    let inner: any;
                                    if (this.isUrlImage(value.value as string)) {
                                        inner = (
                                            <img
                                                src={value.value as string}
                                                style={{height: '2rem', width: 'auto'}}
                                                alt={value.value as string}
                                                title={value.value as string}
                                            />
                                        );
                                    } else {
                                        inner = value.value;
                                    }
                                    result = (
                                        <a
                                            href={(value.value as string)}
                                            target="_blank"
                                        >
                                            {inner}
                                        </a>
                                    );
                                    break;

                                case (value.value as string).startsWith('data:'):
                                    const mime = (value.value as string).split(';')[0].split(':')[1];
                                    switch (true) {
                                        case mime.startsWith('audio/'):
                                            result = (
                                                <audio
                                                    controls={true}
                                                    style={{width: '100%', minWidth: '9rem'}}>
                                                    <source src={(value.value as string)} type={mime}/>
                                                </audio>
                                            );
                                            break;

                                        case mime.startsWith('video/'):
                                            result = (
                                                <button
                                                    className="sft-table-cell-button"
                                                    onClick={(e: any) => {root.playVideo('Video', (value.value as string), mime); }}
                                                >
                                                    Play Video
                                                </button>
                                            );
                                            break;

                                        default:
                                            const dnld: string = this.makeFileName('file', mime);
                                            result = (
                                                <a href={(value.value as string)} target="_blank" download={dnld}>Download File</a>
                                            );
                                            break;
                                    }

                                    break;

                                case root.maxColText > 0 && (value.value as string).length > root.maxColText:
                                    result = (
                                        <button
                                            onClick={(e: any) => {this.showContent(value.developerName, value.value as string); }}
                                        >
                                            {'View Content'}
                                        </button>
                                    );
                                    break;

                                default:
                                    result = (
                                        <span
                                            className="sft-table-cell-text"
                                        >
                                            {(value.value as string)}
                                        </span>
                                    );
                                    break;
                            }

                            break;
                        case eContentType.ContentNumber:
                            if (((value as any).Value as string) === '') {
                                result = (
                                    <span
                                        className="sft-table-cell-text"
                                    />
                                );
                            } else {
                                result = (
                                    <span
                                        className="sft-table-cell-text"
                                    >
                                        {(value.value as string)}
                                    </span>
                                );
                            }
                            break;
                        case eContentType.ContentBoolean:
                            if (((value as any).Value as string)?.toLowerCase() === 'true') {
                                result = (
                                    <span
                                        className="sft-table-cell-text sft-table-cell-boolean sft-table-cell-boolean-true glyphicon glyphicon-ok"
                                    />
                                );
                            } else {
                                result = (
                                    <span
                                        className="sft-table-cell-text sft-table-cell-boolean sft-table-cell-boolean-false glyphicon glyphicon-remove"
                                    />
                                );
                            }
                            break;

                        default:
                            result = (
                                <span
                                    className="sft-table-cell-text"
                                >
                                    {(value.value as string)}
                                </span>
                            );
                            break;
                    }
                }
            }
        } else {
            console.log('One of the columns in the table had a null name.  Check the table display columns settings in Flow');
        }
        return result;
    }

    isUrlImage(url: string): boolean {
        if (
            url.endsWith('jpg') ||
            url.endsWith('jpeg') ||
            url.endsWith('jfif') ||
            url.endsWith('png') ||
            url.endsWith('bmp') ||
            url.endsWith('ico') ||
            url.endsWith('gif')
        ) { return true; } else {
            return false;
        }
    }

    isJSON(value: string): boolean {
        if (value === 'null') { value = ''; }
        if (value.indexOf('{') < 0) { return false; }
        try {
            value = value.replaceAll('\\n ', '');
            value = value.replaceAll('\\n}', '}');
            value = value.replaceAll('\\', '"');
            value = value.replaceAll('\"', '"');
            const obj = JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    showJSON(title: string, value: string) {
        const root: SearchFilterTable = this.props.root;
        value = value.replaceAll('\\n ', '');
        value = value.replaceAll('\\n}', '}');
        value = value.replaceAll('\\', '"');
        value = value.replaceAll('\"', '"');
        const jj: string = JSON.stringify(JSON.parse(value), undefined, 4);
        // jj = jj.replaceAll('/&', '&amp;').replaceAll('/<', '&lt;').replaceAll('/>', '&gt;');

        const content = (
            <div
                style={{
                    maxHeight: '40vmax',
                    maxWidth: '60vmax',
                    overflow: 'auto',
                }}
            >
                <div
                    style={{
                        overflow: 'visible',
                        whiteSpace: 'pre',
                        textAlign: 'left',
                        fontSize: '1rem',
                    }}
                >
                    {jj}
                </div>
            </div>

        );
        root.messageBox.showMessageBox(title, content, [new modalDialogButton('Ok', root.messageBox.hideMessageBox)]);
    }

    isContent(value: string): boolean {
        if (value === 'null') { value = ''; }
        if (value.indexOf('\\n') > 0 || /<\/?[a-z][\s\S]*>/i.test(value)) {
            return true;
        } else {
            return false;
        }
    }

    showContent(title: string, value: string) {
        value = value.replaceAll('\\n', '<br>');
        value = value.replaceAll('<br><br>', '<br>');
        const content = (
            <div
                style={{
                    maxHeight: '40vmax',
                    maxWidth: '60vmax',
                    overflow: 'auto',
                }}
            >
                <div
                    style={{
                        overflow: 'visible',
                        whiteSpace: 'pre',
                        fontSize: '1rem',
                    }}
                    dangerouslySetInnerHTML={{__html: value}}
                />
            </div>

        );
        const root: SearchFilterTable = this.props.root;
        root.messageBox.showMessageBox(title, content, [new modalDialogButton('Ok', root.messageBox.hideMessageBox)]);
    }

    makeFileName(name: string, mimeType: string): string {
        const fileName: string = name;
        switch (mimeType) {
            case 'audio/webm': return fileName + '.webm';

            default: return fileName;
        }
    }
}
