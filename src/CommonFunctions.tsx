import { eContentType, FlowComponent, FlowDisplayColumn, FlowField, FlowObjectData, FlowObjectDataArray, FlowObjectDataProperty, FlowOutcome } from 'flow-component-model';
import {SFT} from './SearchFilterTable';
import * as React from 'react';

export class SFTCommonFunctions {

    static async getFlowValue(): Promise<any> {

    }

    static async assessGlobalOutcomeRule(outcome: FlowOutcome, root: SFT): Promise<boolean> {
        let result: boolean = true;

        if (outcome.attributes['RequiresSelected']?.value === 'true'){
            if(root.parent.model.multiSelect===true){
                // must have 1 or more in selectedRowMap
                if(root.selectedRowMap.size < 1){
                    result = false;
                }
            }
            else{
                if(!root.selectedRow || root.selectedRow.length < 1){
                    result = false;
                }
            }
        } 

        if (outcome.attributes['RequiresRows']?.value === 'true' && root.rowMap.size < 1) {
            result = false;
        }

        if (outcome.attributes.rule && outcome.attributes.rule.value.length > 0) {
            try {
                const rule = JSON.parse(outcome.attributes.rule.value);
                
                let contentType: eContentType;
                // since this is a global then the value of the rule.field must be a flow field or the property of one
                // split the rule.field on the separator
                let match: any;
                let fld: string = rule.field;
                let fld2 = rule.value;
                let value: any = fld;
                let compareTo: any = fld2;
                while (match = RegExp(/{{([^}]*)}}/).exec(fld)) {
                    // is it a known static
                    switch (match[1]) {
                        case 'TENANT_ID':
                            contentType = eContentType.ContentString;
                            value = 'MyTenentId';
                            break;

                        default:
                            const fldElements: string[] = match[1].split('->');
                            // element[0] is the flow field name
                            let val: FlowField;
                            if (root.parent.fields[fldElements[0]]) {
                                val = root.parent.fields[fldElements[0]];
                            } else {
                                val = await root.parent.loadValue(fldElements[0]);
                            }

                            if (val) {
                                let od: FlowObjectData = val.value as FlowObjectData;
                                if (od) {
                                    if (fldElements.length > 1) {
                                        for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                                            contentType = (od as FlowObjectData).properties[fldElements[epos]]?.contentType;
                                            od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                                        }
                                        value = od;
                                    } else {
                                        value = val.value;
                                        contentType = val.contentType;
                                    }
                                } else {
                                    value = val.value;
                                    contentType = val.contentType;
                                }
                            }
                            break;
                    }
                    fld = fld.replace(match[0], value);
                }
                
                while (match = RegExp(/{{([^}]*)}}/).exec(fld2)) {
                    // is it a known static
                    switch (match[1]) {
                        case 'TENANT_ID':
                            contentType = eContentType.ContentString;
                            value = 'MyTenentId';
                            break;

                        default:
                            const fldElements: string[] = match[1].split('->');
                            // element[0] is the flow field name
                            let val: FlowField;
                            if (root.parent.fields[fldElements[0]]) {
                                val = root.parent.fields[fldElements[0]];
                            } else {
                                val = await root.parent.loadValue(fldElements[0]);
                            }

                            if (val) {
                                let od: FlowObjectData = val.value as FlowObjectData;
                                if (od) {
                                    if (fldElements.length > 1) {
                                        for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                                            contentType = (od as FlowObjectData).properties[fldElements[epos]]?.contentType;
                                            od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                                        }
                                        compareTo = od;
                                    } else {
                                        compareTo = val.value;
                                        contentType = val.contentType;
                                    }
                                } else {
                                    compareTo = val.value;
                                    contentType = val.contentType;
                                }
                            }
                            break;
                    }
                    fld2 = fld2.replace(match[0], value);
                }

                result = result && SFTCommonFunctions.assessRule(value, rule.comparator, compareTo, contentType);
            } catch (e) {
                console.log('The rule on top level outcome ' + outcome.developerName + ' is invalid');
            }
        }

        return result;
    }

    static assessRowOutcomeRule(outcome: FlowOutcome, row: FlowObjectData, root: SFT): boolean {
        let result: boolean = true;
        if(!outcome) {
            return false
        }
        if (outcome.attributes.rule && outcome.attributes.rule.value.length > 0) {
            try {
                const rule = JSON.parse(outcome.attributes.rule.value);
                
                let contentType: eContentType;
                let match: any;
                let fld: string = rule.field;
                let fld2: string = rule.value;
                let value: any = fld;
                let compareTo: any= fld2;
                while (match = RegExp(/{{([^}]*)}}/).exec(fld)) {
                    // is it a known static
                    switch (match[1]) {
                        case 'TENANT_ID':
                            contentType = eContentType.ContentString;
                            value = 'MyTenentId';
                            break;

                        default:
                            const fldElements: string[] = match[1].split('->');
                            // element[0] is the flow field name
                            let val: FlowField;
                            val = root.parent.fields[fldElements[0]];
                            
                            if (val) {
                                let od: FlowObjectData = val.value as FlowObjectData;
                                if (od) {
                                    if (fldElements.length > 1) {
                                        for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                                            contentType = (od as FlowObjectData).properties[fldElements[epos]]?.contentType;
                                            od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                                        }
                                        value = od;
                                    } else {
                                        value = val.value;
                                        contentType = val.contentType;
                                    }
                                } else {
                                    value = val.value;
                                    contentType = val.contentType;
                                }
                            }
                            break;
                    }
                    fld = fld.replace(match[0], value);
                }

                while (match = RegExp(/{{([^}]*)}}/).exec(fld2)) {
                    // is it a known static
                    switch (match[1]) {
                        case 'TENANT_ID':
                            contentType = eContentType.ContentString;
                            value = 'MyTenentId';
                            break;

                        default:
                            const fldElements: string[] = match[1].split('->');
                            // element[0] is the flow field name
                            let val: FlowField;
                            val = root.parent.fields[fldElements[0]];
                            
                            if (val) {
                                let od: FlowObjectData = val.value as FlowObjectData;
                                if (od) {
                                    if (fldElements.length > 1) {
                                        for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                                            contentType = (od as FlowObjectData).properties[fldElements[epos]]?.contentType;
                                            od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                                        }
                                        compareTo = od;
                                    } else {
                                        compareTo = val.value;
                                        contentType = val.contentType;
                                    }
                                } else {
                                    compareTo = val.value;
                                    contentType = val.contentType;
                                }
                            }
                            break;
                    }
                    fld2 = fld2.replace(match[0], value);
                }

                if (row.properties[fld]) {
                    const property: FlowObjectDataProperty = row.properties[fld];
                    result = SFTCommonFunctions.assessRule(property.value, rule.comparator, compareTo, property.contentType);
                } else {
                    result = SFTCommonFunctions.assessRule(value, rule.comparator, compareTo, contentType);
                }

            } catch (e) {
                console.log('The rule on row level outcome ' + outcome.developerName + ' is invalid');
            }
        }
        return result;
    }

    static assessRule(value: any, comparator: string, compareTo: string, fieldType: eContentType): boolean {
        let comparee: any;
        let comparer: any;
        let result: boolean = true;
        switch (fieldType) {
            case eContentType.ContentNumber:
                comparee = parseInt(compareTo);
                comparer = value;
                break;
            case eContentType.ContentDateTime:
                comparee = new Date(compareTo);
                comparer = value;
                break;
            case eContentType.ContentBoolean:
                comparee = ('' + compareTo).toLowerCase() === 'true';
                comparer = value;
                break;
            case eContentType.ContentString:
            default:
                comparee = compareTo.toLowerCase().split(",");
                if(comparee.length>0){
                    for(let pos=0 ; pos < comparee.length ; pos++) {
                        comparee[pos] = comparee[pos].trim();
                    }
                }
                if(["in","not in"].indexOf(comparator.toLowerCase()) < 0) {
                    comparee=comparee[0];
                }
                comparer = (value as string)?.toLowerCase();
                break;
        }

        switch (comparator.toLowerCase()) {
            case 'equals':
                result = comparer === comparee;
                break;
            case 'not equals':
                result = comparer !== comparee;
                break;
            case 'contains':
                result = comparer.indexOf(comparee) >= 0;
                break;
            case 'not contains':
                result = comparer.indexOf(comparee) < 0;
                break;
            case 'starts with':
                result = ('' + comparer).startsWith(comparee);
                break;
            case 'ends with':
                result = ('' + comparer).endsWith(comparee);
                break;
            case 'in':
                result = comparee.indexOf(comparer) >= 0;
                break;
            case 'not in':
                result = comparee.indexOf(comparer) < 0;
                break;
            case 'lt':
                result = parseInt('' + comparer) < parseInt('' + comparee);
                break;
            case 'lte':
                result = parseInt('' + comparer) <= parseInt('' + comparee);
                break;
            case 'gt':
                result = parseInt('' + comparer) > parseInt('' + comparee);
                break;
            case 'gte':
                result = parseInt('' + comparer) >= parseInt('' + comparee);
                break;
        }
        return result;
    }

    /* MOVED TO FLOW COMPONENT MODEL
    static makeObjectDataArrayFromJSON(json: string, primaryKey: string, columns: FlowDisplayColumn[], flowTypeName: string) : FlowObjectDataArray {
        let objDataArray: FlowObjectDataArray = new FlowObjectDataArray();
        let model: any[] = JSON.parse(json);
        model.forEach((item: any) => {
            let objData: FlowObjectData = FlowObjectData.newInstance(flowTypeName);
            columns.forEach((col: FlowDisplayColumn) => {
                let val: any = item[col.developerName]; 
                if(col.developerName===primaryKey){
                    //objData.internalId = val;
                    objData.externalId = val;
                }
                switch(col.contentType){
                    case eContentType.ContentDateTime:
                        val = new Date(val);
                        break;
                    case eContentType.ContentNumber:
                        val = parseFloat(val);
                        break;
                    case eContentType.ContentBoolean:
                        val = val === "true";
                        break;
                }
                objData.addProperty(FlowObjectDataProperty.newInstance(col.developerName, col.contentType, val));
                objData.properties[col.developerName].typeElementPropertyId = col.typeElementPropertyId;
            });
            objDataArray.addItem(objData);
        });

        return objDataArray;
    }
    */

    // this will make an outcome button (top or row) based on the outcome name, the suffix & icon
    // the values, if {{}} ere prepopulated in preLoad
    static makeOutcomeButton(comp: SFT, outcome: FlowOutcome, suffix: string, objectData: FlowObjectData, dissabled: boolean) : Promise<any> {
        let icon: any;
        let show: boolean = false;
        if(outcome.attributes?.iconValue?.value?.length > 0){
            let flds: []
            let iconName: string
            let iconValue: string = outcome.attributes?.iconValue?.value;
            iconValue = this.extractValue(comp.parent, iconValue, new Map(Object.entries(comp.parent.fields)));
            if(suffix && suffix.length>0){
                let path = iconValue.substring(0,iconValue.lastIndexOf("."));
                let ext: string = iconValue.substring(iconValue.lastIndexOf("."));
                iconName = path + "_" + suffix.toLowerCase() + ext;
            }
            else {
                iconName=iconValue;
            }
            let imgClass: string = "sft-ribbon-search-button-image";
            if(dissabled){
                imgClass += " sft-ribbon-search-button-image-grey"
            }
            icon=(
                <img 
                    className={imgClass}
                    src={iconName}
                    onError={(e: any)=>{e.currentTarget.src=iconValue}}
                    title={outcome.label || outcome.developerName}
                />
            );
            show=true;
        }
        else {
            if(outcome.attributes?.icon?.value?.length > 0 && outcome.attributes?.icon?.value !== "null") {
                let iconClass: string = " sft-ribbon-search-button-icon";
                if(dissabled){
                    iconClass += "sft-ribbon-search-button-image-grey"
                }
                icon=(
                    <span
                        key={outcome.developerName}
                        className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' ' + iconClass}
                        title={outcome.label || outcome.developerName}
                    />
                );
                show=true;
            }
        }

        let button: any;
        if(show===true){
            button = (
            <div
                className={'sft-ribbon-search-button-wrapper ' + (outcome.attributes?.classes?.value)}
                onClick={(e: any) => {if(!dissabled){e.stopPropagation(); comp.doOutcome(outcome.developerName, objectData);} }}
            >
                {icon}
                {!outcome.attributes?.display || outcome.attributes.display?.value.indexOf('text') >= 0 ?
                    <span
                        className="sft-ribbon-search-button-label"
                    >
                        {outcome.label}
                    </span> :
                    null
                }
            </div>
            );
        }
        return button;
    }

    static extractValue(comp: FlowComponent, input: string, flds: Map<string,FlowField>) : string {
        if(input){
            // use regex to find any {{}} tags in content and save them in matches
            let value: any;
            let match: any;
            
            const matches: any[] = [];
            while (match = RegExp(/{{([^}]*)}}/).exec(input)) {
                const fldElements: string[] = match[1].split('->');
                let fld: FlowField;
                if(flds.has(fldElements[0])){
                    fld = flds.get(fldElements[0]);
                }

                if (fld) {
                    let od: FlowObjectData = fld.value as FlowObjectData;
                    if (od) {
                        if (fldElements.length > 1) {
                            for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                                od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                            }
                            value = od;
                        } else {
                            value = fld.value;
                        }
                    } else {
                        value = fld.value;
                    }
                    input = input.replace(match[0], value);
                }
            }
        }
        return input;
    }

    static async inflateValue(comp: FlowComponent, input: string, flds: Map<string,FlowField>) : Promise<string> {
        if(input){
            // use regex to find any {{}} tags in content and save them in matches
            let value: any;
            let match: any;
            
            const matches: any[] = [];
            while (match = RegExp(/{{([^}]*)}}/).exec(input)) {
                const fldElements: string[] = match[1].split('->');
                let fld: FlowField;
                if(!flds.has(fldElements[0])){
                    fld = await comp.loadValue(fldElements[0]);
                    flds.set(fldElements[0], fld);
                }
                else {
                    fld = flds.get(fldElements[0]);
                }

                if (fld) {
                    let od: FlowObjectData = fld.value as FlowObjectData;
                    if (od) {
                        if (fldElements.length > 1) {
                            for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                                od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                            }
                            value = od;
                        } else {
                            value = fld.value;
                        }
                    } else {
                        value = fld.value;
                    }
                    input = input.replace(match[0], value);
                }
            }
        }
        return input;
    }
}
