import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { subscribe, MessageContext, unsubscribe, publish} from 'lightning/messageService';
import { updateRecord } from 'lightning/uiRecordApi';
import { showNotification } from "c/genericNotifications";
import { getConstants } from 'c/projectConstants';
import PRJ_LMS from '@salesforce/messageChannel/projectLMS__c';
import PRJ_BOTTOM_UP_LMS from '@salesforce/messageChannel/projectBottomUpLMS__c';
import getMilestoneRecords from '@salesforce/apex/ProjectMilestoneController.getProjectMilestoneList';
import milestoneCount from '@salesforce/apex/ProjectMilestoneController.milestoneCount';

const CONSTANTS = getConstants();
const columns = CONSTANTS.MILESTONE_DATATABLE_COLUMNS;

export default class ProjectMilestone extends LightningElement {
    defaultMessage = CONSTANTS.DEFAULT_MILESTONE_MSG;
    headerValue;
    createFlag = false;
    newMilestoneClicked = false;
    showLoading = false;
    data = [];
    options = [];
    subscriptions = [];
    columns = columns;
    wiredMilestoneListResult;
    projectId;
    wiredMilestoneCountResult;
    pageValue = 1;
    offset = 0;

    //Getter 
    get showDefaultMessage() {
        return this.data && this.data.length ? false : true;
    }

    get newMilestoneDisabled() {
        return this.projectId ? false : true;
    }

    // Subscribe when the component loads
    connectedCallback() {
        this.subscribeToChannel(PRJ_LMS,'TopToBottom');
        this.subscribeToChannel(PRJ_BOTTOM_UP_LMS,'BottomUp');
    }

    subscribeToChannel(messageChannel,channel) {
        if (this.messageContext) {
            const subscription = subscribe(
                this.messageContext,
                messageChannel,
                (message) => this.handleMessage(message,channel)
            );
            this.subscriptions.push(subscription);
        }
    }

    //LMS Related
    @wire(MessageContext) messageContext;

    //Load Project milestones based on the project selected
    @wire(getMilestoneRecords, { projectId: '$projectId', offset: '$offset' })
    milestoneList(result) {
        this.wiredMilestoneListResult = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;
        } else {
            this.data = undefined;
        }
    }

    //Get Total Count of the milestone records 
    @wire(milestoneCount, { projectId: '$projectId' })
    projectCount(result) {
        this.wiredMilestoneCountResult = result;
        if (result.data) {
            let totalRecords = result.data;
            const totalPages = Math.ceil(totalRecords / 5);
            this.options = [];
            for (let i = 1; i <= totalPages; i++) {
                this.options.push({
                    label: i,
                    value: i
                });
            }
        }
    }

    //event received from Child Component (createUpdateMilestone)
    handleClose() {
        this.newMilestoneClicked = false;
        refreshApex(this.wiredMilestoneListResult);
        refreshApex(this.wiredMilestoneCountResult);
    }

    //On click method for New Project Milestone button
    handleNewMilestone() {
        this.createFlag = true;
        this.newMilestoneClicked = true;
        this.headerValue = CONSTANTS.NEW_TITLE + CONSTANTS.SPACE_VAL + CONSTANTS.MILESTONE;
    }

    handleRowSelection(event) {
        if (event.detail.selectedRows.length) {
            let selectedRowId = event.detail.selectedRows[0].Id;
            this.handlePublishMessage(selectedRowId,'rowAction');
        }
    }

    // Handle incoming messages
    handleMessage(message,channel) {
        if(channel==='TopToBottom'){
            this.projectId = message.projectId;
            if (!this.projectId) {
                this.data = undefined;
            }
        }else{
            this.handleClose();
        }
        
    }

    // Unsubscribe when component is destroyed (prevents memory leaks)
    disconnectedCallback() {
        // Unsubscribe from all channels when component is destroyed
        this.subscriptions.forEach(subscription => {
            unsubscribe(subscription);
        });
        this.subscriptions = [];
    }

    handleSave(event) {
        this.showLoading = true;
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return {
                fields
            };
        });

        // Updateing the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            showNotification(this, CONSTANTS.SUCCESS_TITLE, 'Records updated successfully!', CONSTANTS.SUCCESS);
        }).catch(error => {
            showNotification(this, CONSTANTS.ERROR_TITLE, error, CONSTANTS.ERROR);
        }).finally(() => {
            this.saveDraftValues = [];
            this.showLoading = false;
            refreshApex(this.wiredMilestoneListResult);
            this.handlePublishMessage(undefined,'refresh');
        });
    }

    // Method to publish the message
    handlePublishMessage(milestoneId,actionValue) {
        var payload;
        if(actionValue==='rowAction'){
            payload = {
                milestoneId: milestoneId,
                projectId: this.projectId
            };
        }else{
            payload = {
                milestoneUpdateFlag: true
            };
        }
        

        // Publish the message
        publish(
            this.messageContext, // Required: MessageContext from @wire
            PRJ_LMS, // The message channel
            payload // Data to send (must match channel fields)
        );
    }

    handlePageChange(event) {
        this.offset = event.detail.value;
    }

}