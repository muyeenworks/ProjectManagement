import { LightningElement, wire } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { getConstants } from 'c/projectConstants';
import { showNotification } from "c/genericNotifications";
import { publish, MessageContext, subscribe,  unsubscribe } from 'lightning/messageService';
import PRJ_TOP_TO_BOTT_LMS from '@salesforce/messageChannel/projectLMS__c';
import PRJ_BOTTOM_UP_LMS from '@salesforce/messageChannel/projectBottomUpLMS__c';
import getProjectCount from '@salesforce/apex/ProjectCompController.projectCount';
import getProjectList from '@salesforce/apex/ProjectCompController.getProjects';

const CONSTANTS = getConstants();
const columns = CONSTANTS.PROJECT_DATATABLE_COLUMNS;

export default class ProjectComp extends LightningElement {
    recordId; //To hold Project Id when row action is invoked
    projectId; //To send the selected Project Id to other components
    defaultMessage = CONSTANTS.DEFAULT_PROJECT_MSG;
    defaultHeaderValue;
    createFlag = false;
    newProjectClicked = false;
    options = [];
    data = [];
    subscriptions = [];
    columns = columns;
    wiredProjectCountResult;
    wiredProjectListResult;
    pageValue = 1;
    offset = 0;

    //Getter to show default message in case there are no Projects created or accessible to the current user.
    get showDefaultMessage() {
        return this.data && this.data.length ? false : true;
    }

    // Subscribe when the component loads
    connectedCallback() {
        this.subscribeToChannel(PRJ_BOTTOM_UP_LMS);
    }

    //To Subscribe to a message channel
    subscribeToChannel(messageChannel) {
        if (this.messageContext) {
            const subscription = subscribe(
                this.messageContext,
                messageChannel,
                (message) => this.handleMessage(message)
            );
            this.subscriptions.push(subscription);
        }
    }

    //LMS related
    @wire(MessageContext) messageContext;

    //Get all the project list accessible to the current user
    @wire(getProjectList, { offset: '$offset' })
    projectList(result) {
        this.wiredProjectListResult = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }

    //Get the count of Projects the current user has access to
    @wire(getProjectCount)
    projectCount(result) {
        this.wiredProjectCountResult = result;
        if (result.data) {
            let totalRecords = result.data;
            const totalPages = Math.ceil(totalRecords / 5);
            this.options = [];
            for (let i = 1; i <= totalPages; i++) {
                this.options.push({ label: i, value: i });
            }
        }
    }

    //On click method for New Project button
    handleNewProject() {
        this.createFlag = true;
        this.newProjectClicked = true;
        this.defaultHeaderValue = CONSTANTS.NEW_TITLE + CONSTANTS.SPACE_VAL + CONSTANTS.PROJECT;
    }

    //event received from Child Component (createUpdateProject)
    handleClose() {
        this.newProjectClicked = false;
        this.recordId = undefined;
        this.refreshRecords();
    }

    //When a particular Project is selected
    handleRowSelection(event) {
        var projectId;
        if (event.detail.selectedRows.length) {
            projectId = event.detail.selectedRows[0].projectId;
        } else {
            projectId = undefined;
        }

        this.handlePublishMessage(projectId);
    }

    //To Handle Edit row action
    handleRowAction(event) {
        let recordId = event.detail.row.projectId;
        const actionName = event.detail.action.name;
        this.recordId = recordId;
        if (actionName === CONSTANTS.EDIT_TITLE) {
            this.defaultHeaderValue = CONSTANTS.UPDATE_TITLE + CONSTANTS.SPACE_VAL + CONSTANTS.PROJECT;
            this.createFlag = false;
            this.newProjectClicked = true;
        }else if(actionName === CONSTANTS.DELETE_TITLE){
            this.deleteProject();
        }
    }

    //handle Project Deletion
    async deleteProject() {
        try {
            await deleteRecord(this.recordId);
            showNotification(this,CONSTANTS.SUCCESS_TITLE, CONSTANTS.PROJECT_DEL_MSG , CONSTANTS.SUCCESS);
            this.refreshRecords();
            this.handlePublishMessage(undefined);
        } catch (error) {
            console.log(error);
            showNotification(this,CONSTANTS.ERROR_TITLE, CONSTANTS.DELETE_PERMISSION_MISSING, CONSTANTS.ERROR);
        }
    }

    // Handle incoming messages
    handleMessage(message,channel) {{
        this.refreshRecords();
    }
}

    //To Refresh Records
    refreshRecords(){
        refreshApex(this.wiredProjectListResult);
        refreshApex(this.wiredProjectCountResult);
    }

    // Method to publish the message
    handlePublishMessage(projectId) {
        const payload = { projectId: projectId, milestoneId: undefined };
        publish(this.messageContext,PRJ_TOP_TO_BOTT_LMS,payload);
    }

    //Handle page change event coming from Child component(pagination)
    handlePageChange(event) {
        this.offset = event.detail.value;
    }

    // Unsubscribe when component is destroyed (prevents memory leaks)
    disconnectedCallback() {
        // Unsubscribe from all channels when component is destroyed
        this.subscriptions.forEach(subscription => {
            unsubscribe(subscription);
        });
        this.subscriptions = [];
    }
}