import { LightningElement,api } from 'lwc';
import { showNotification } from "c/genericNotifications";
import { getConstants } from 'c/projectConstants';
import OWNER_FIELD from '@salesforce/schema/Project__c.OwnerId';
import USER_ID from '@salesforce/user/Id';

const CONSTANTS = getConstants();

export default class CreateUpdateProject extends LightningElement {
    
    @api createFlag;
    @api headerValue;
    @api recordId;
    selectedUserId = USER_ID;
    showLoading = false;
    ownerField = OWNER_FIELD;

    filter = {
        criteria: [
            {
                fieldPath: 'Profile.Name',
                operator: 'eq',
                value: 'System Administrator',
            },
            {
                fieldPath: 'Profile.Name',
                operator: 'eq',
                value: 'Standard User',
            },
        ],
        filterLogic: '(1 OR 2)',
    };
    
    //enables lightning spinner
    handleSubmit(event){
        this.showLoading = true;
        if(!this.validateForm()){
            this.showLoading = false;
            return;
        }
        event.preventDefault();
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        const fields = {};
        inputFields.forEach(field => {
            fields[field.fieldName] = field.value;
        });
        fields.OwnerId = this.selectedUserId;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    //method to handle form submission success
    handleSuccess(){
        this.showLoading = false;//disable spinner
        this.handleCancel();
        let finalMsg = this.createFlag ? CONSTANTS.CREATED_MSG : CONSTANTS.UPDATED_MSG;
        showNotification(this,CONSTANTS.SUCCESS_TITLE, CONSTANTS.PROJECT+CONSTANTS.SPACE_VAL+finalMsg, CONSTANTS.SUCCESS);
    }

    //method to handle form submission errors
    handleError(event){
        this.showLoading = false;//disable spinner
        let errorMsg = event.detail.detail;
        showNotification(this,CONSTANTS.ERROR_TITLE, errorMsg, CONSTANTS.ERROR);
    }

    //method to handle cancel button click
    handleCancel(){
        this.dispatchEvent(new CustomEvent(CONSTANTS.CLOSE));
    }

    handleChange(event) {
        this.selectedUserId = event.detail.recordId;
        console.log(this.selectedUserId);
    }

    validateForm() {
        var validForm = true;
        const userRec = this.template.querySelector('lightning-record-picker');
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        inputFields.forEach(field => {
            if (!field.reportValidity()) {
                validForm = false;
            }
        });
        if (!this.selectedUserId) {
            userRec.setCustomValidity('User is required.');
          validForm = false;
        }
        userRec.reportValidity();
        return validForm;

      }
}