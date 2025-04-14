import { LightningElement, wire, api} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { getConstants } from 'c/projectConstants';
import { subscribe, MessageContext, unsubscribe, publish } from 'lightning/messageService';
import { deleteRecord } from 'lightning/uiRecordApi';
import PRJ_LMS from '@salesforce/messageChannel/projectLMS__c';
import PRJ_BOTTOM_UP_LMS from '@salesforce/messageChannel/projectBottomUpLMS__c';
import getToDoRecords from '@salesforce/apex/ProjectToDoController.getProjectToDoList';
import getTodoCount from '@salesforce/apex/ProjectToDoController.getTodoCount';
import { showNotification } from "c/genericNotifications";

const CONSTANTS = getConstants();

export default class ProjectToDo extends LightningElement {
    recordId;
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
                this.options.push({ label: i, value: i });
            }
        }
    }

    //One New To Do Button Click
    handleNewToDo() {
        this.createFlag = true;
        this.newToDoClicked = true;
    }

     //To Handle Edit row action
     handleRowAction(event) {
        let recordId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        this.recordId = recordId;
        if (actionName === CONSTANTS.EDIT_TITLE) {
            this.headerValue = CONSTANTS.UPDATE_TITLE + CONSTANTS.SPACE_VAL + CONSTANTS.TO_DO;
            this.createFlag = false;
            this.newToDoClicked = true;
        }else if(actionName === CONSTANTS.DELETE_TITLE){
            this.deleteToDo();
        }
    }

    //handle Milestone Deletion
        async deleteToDo() {
            try {
                await deleteRecord(this.recordId);
                showNotification(this,CONSTANTS.SUCCESS_TITLE, CONSTANTS.TO_DO_DEL_MSG , CONSTANTS.SUCCESS);
                this.refreshRecords();
                this.handlePublishMessage();
            } catch (error) {
                showNotification(this,CONSTANTS.ERROR_TITLE, CONSTANTS.DELETE_PERMISSION_MISSING, CONSTANTS.ERROR);
            }
        }

    //new To Do Form Closed
    handleClose() {
        this.newToDoClicked = false;
        this.refreshRecords();
        this.handlePublishMessage();
    }

    //To Refresh Records
    refreshRecords(){
        refreshApex(this.wiredToDoListResult);
        refreshApex(this.wiredToDoCountResult);
    }

    //LMS Message Received
    handleMessage(message) {
        this.milestoneId = message.milestoneId;
    }

    //Invoked from Child component(pagination)
    handlePageChange(event) {
        this.offset = event.detail.value;
    }

    // Method to publish the message
    handlePublishMessage() {
        const payload = { toDoUpdateFlag : true };
        publish(this.messageContext,PRJ_BOTTOM_UP_LMS,payload);
    }

    //To unsubscribe the channel post component close
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }
}