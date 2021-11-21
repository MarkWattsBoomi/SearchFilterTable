import { eContentType, FlowDisplayColumn, FlowMessageBox, FlowObjectData, FlowObjectDataProperty, FlowOutcome } from 'flow-component-model';
import React from 'react';
import CommonFunctions from './CommonFunctions';
import SearchFilterTable from './SearchFilterTable';

export default class SearchFilterTableRow extends React.Component<any, any> {
    
    

    render() {

        const root: SearchFilterTable = this.props.root;
        const objData: FlowObjectData = root.rowMap.get(this.props.id)?.objectData;

        const buttons: any[] = [];
        Object.keys(root.outcomes).forEach((key: string) => {
            if (root.outcomes[key].isBulkAction === false) {
                let showOutcome: boolean = CommonFunctions.assessRowOutcomeRule(root.outcomes[key],objData);

                if(showOutcome===true){
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
                className="sft-table-cell"
            >
                <input
                    className="sft-checkbox"
                    type="checkbox"
                    onClick={(event: any) => {root.toggleSelect(event, this.props.id); }}
                    checked={root.selectedRowMap.has(this.props.id)}
                />
            </td>,
        );

        if (buttons.length > 0) {
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

        root.colMap.forEach((col: FlowDisplayColumn) => {
            const val: any = this.formatValue(col.contentType, root, objData?.properties[col.developerName]);

            cols.push(
                <td
                    className="sft-table-cell"
                >
                    {val}
                </td>,
            );
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
    formatValue(contentType: eContentType,  root: SearchFilterTable, value: FlowObjectDataProperty): any {
        let result: any;
        switch (contentType) {
            case eContentType.ContentDateTime:
                const dt: Date = new Date(value.value as string);
                if ((dt instanceof Date && !isNaN(dt.getTime())) === true) {
                    result = (
                        <span
                            className="sft-table-cell-text"
                        >
                            {dt.toLocaleString()}
                        </span>
                    );
                } else {
                    <span className="sft-table-cell-text" />;
                }
                break;

            case eContentType.ContentString:
                switch (true) {
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
                            <a href={(value.value as string)} target="_blank">
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

    makeFileName(name: string, mimeType: string): string {
        const fileName: string = name;
        switch (mimeType) {
            case 'audio/webm': return fileName + '.webm';

            default: return fileName;
        }
    }
}
