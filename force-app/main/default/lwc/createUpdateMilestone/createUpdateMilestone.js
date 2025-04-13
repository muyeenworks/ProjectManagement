import { LightningElement,api } from 'lwc';
import { showNotification } from "c/genericNotifications";
import { getConstants } from 'c/projectConstants';

const CONSTANTS = getConstants();

export default class CreateUpdateMilestone extends LightningElement {
    @api createFlag;
    @api headerValue;
    @api recordId;
    @api projectId;
    showLoading = false;
    
    //enables lightning spinner
    runSpinner(){
        this.showLoading = true;
    }

    //method to handle form submission success
    handleSuccess(){
        this.showLoading = false;//disable spinner
        this.handleCancel();
        let finalMsg = this.createFlag ? CONSTANTS.CREATED_MSG : CONSTANTS.UPDATED_MSG;
        showNotification(this,CONSTANTS.SUCCESS_TITLE, CONSTANTS.MILESTONE+CONSTANTS.SPACE_VAL+finalMsg, CONSTANTS.SUCCESS);
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
}