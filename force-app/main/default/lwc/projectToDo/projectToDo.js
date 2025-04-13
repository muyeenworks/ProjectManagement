import { LightningElement, wire, api} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { getConstants } from 'c/projectConstants';
import { subscribe, MessageContext, unsubscribe, publish } from 'lightning/messageService';
import PRJ_LMS from '@salesforce/messageChannel/projectLMS__c';
import PRJ_BOTTOM_UP_LMS from '@salesforce/messageChannel/projectBottomUpLMS__c';
import getToDoRecords from '@salesforce/apex/ProjectToDoController.getProjectToDoList';
import getTodoCount from '@salesforce/apex/ProjectToDoController.getTodoCount';
import { updateRecord } from 'lightning/uiRecordApi';
import { showNotification } from "c/genericNotifications";

const CONSTANTS = getConstants();

export default class ProjectToDo extends LightningElement {
    defaultMessage = CONSTANTS.DEFAULT_TODO_MSG;
    headerValue = CONSTANTS.NEW_TITLE + CONSTANTS.SPACE_VAL + CONSTANTS.TO_DO;
    columns = CONSTANTS.TODO_DATATABLE_COLUMNS;
    data = [];
    options = [];
    wiredToDoListResult;
    wiredToDoCountResult;
    _milestoneId;
    showLoading = false;
    newToDoClicked = false;
    createFlag = false;
    pageValue = 1;
    offset = 0;

    //Getter Setter Start
    get showDefaultMessage() {
        return this.data && this.data.length ? false : true;;
    }

    get newToDoDisabled() {
        return this.milestoneId ? false : true;
    }

    get milestoneId() {
        return this._milestoneId;
    }

    @api set milestoneId(value) {
        this._milestoneId = value;
        if (!value) {
            this.data = undefined;
        }
    }
    //Getter Setter Ends   

    //Connected Callback to Subscribe to LMS
    connectedCallback() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                PRJ_LMS,
                (message) => {
                    this.handleMessage(message);
                }
            );
        }
    }

    //LMS Related
    @wire(MessageContext) messageContext;

    //Get List of To Do Records for the selected milestone
    @wire(getToDoRecords, { milestoneId: '$milestoneId', offset: '$offset' })
    milestoneList(result) {
        this.wiredToDoListResult = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;
        } else {
            this.data = undefined;
        }
    }

    //Get Total Count of the milestone records 
    @wire(getTodoCount, { milestoneId: '$milestoneId' })
    projectCount(result) {
        this.wiredToDoCountResult = result;
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

    //One New To Do Button Click
    handleNewToDo() {
        this.createFlag = true;
        this.newToDoClicked = true;
    }

    //new To Do Form Closed
    handleClose() {
        this.newToDoClicked = false;
        refreshApex(this.wiredToDoListResult);
        refreshApex(this.wiredToDoCountResult);
        this.handlePublishMessage();
    }

    //LMS Message Received
    handleMessage(message) {
        this.milestoneId = message.milestoneId;
    }

    //To save edited datatable
    handleSave(event) {
        this.showLoading = true;
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        // Updateing the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            showNotification(this, CONSTANTS.SUCCESS_TITLE, CONSTANTS.RECORDS_UPDATED_MESSAGE, CONSTANTS.SUCCESS);
        }).catch(error => {
            showNotification(this, CONSTANTS.ERROR_TITLE, error, CONSTANTS.ERROR);
        }).finally(() => {
            this.saveDraftValues = [];
            this.showLoading = false;
            refreshApex(this.wiredToDoListResult);
            refreshApex(this.wiredToDoCountResult);
            this.handlePublishMessage();
        });
    }

    //Invoked from Child component(pagination)
    handlePageChange(event) {
        this.offset = event.detail.value;
    }

    //To unsubscribe the channel post component close
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Method to publish the message
    handlePublishMessage() {
        const payload = {
            toDoUpdateFlag : true
        };
        publish(
            this.messageContext,
            PRJ_BOTTOM_UP_LMS,
            payload
        );
    }
}