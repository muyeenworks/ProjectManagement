const getConstants = () =>{
    return {
        CREATED_MSG : 'created successfully!',
        UPDATED_MSG : 'updated successfully!',
        SUCCESS : 'success',
        ERROR : 'error',
        CLOSE : 'close',
        EDIT : 'edit',
        DEFAULT_PROJECT_MSG : 'Get started by creating your first project using the \'New Project\' button.',
        DEFAULT_MILESTONE_MSG : 'Select a project first to see its milestones or add a \'New Milestone\'.',
        DEFAULT_TODO_MSG : 'Select a milestone first to see its tasks or add a \'New To-Do\'.',
        SUCCESS_TITLE : 'Success',
        ERROR_TITLE : 'Error',
        NEW_TITLE : 'New',
        UPDATE_TITLE : 'Update',
        EDIT_TITLE : 'Edit',
        PROJECT : 'Project',
        MILESTONE : 'Project Milestone',
        TO_DO : 'To Do',
        SPACE_VAL: ' ',
        RECORDS_UPDATED_MESSAGE : 'Records updated successfully!',
        PROJECT_DATATABLE_COLUMNS : [
                                        { label: 'Project Name', fieldName: 'projectName' },
                                        { label: 'Description', fieldName: 'projectDescription' },
                                        { label: 'Status', fieldName: 'projectStatus', type: 'text' },
                                        { label: 'Owner', fieldName: 'projectOwner', type: 'text' },
                                        { label: 'Created Date', fieldName: 'projectCreatedDate', type: 'date' },
                                        { label: 'Complete %', fieldName: 'projectComplete', type: 'percent',  
                                            cellAttributes: { alignment: 'left' }
                                        },
                                        {   label:'Action',
                                            type: 'action',
                                            typeAttributes: {
                                                rowActions: [{ label: 'Edit', name: 'Edit' }]
                                            },
                                        },
                                    ],
        MILESTONE_DATATABLE_COLUMNS : [
                                        { label: 'Milestone Name', fieldName: 'Name', editable: true },
                                        { label: 'Status', fieldName: 'Status__c', type: 'text', editable: false },
                                        { label: 'Complete %', fieldName: 'Complete__c', type: 'percent', editable: false }
                                    ],
        TODO_DATATABLE_COLUMNS : [
                                    { label: 'To Do Name', fieldName: 'Name', editable: true },
                                    { label: 'Status', fieldName: 'Status__c', type: 'text', editable: true },
                                    { label: 'Due Date', fieldName: 'Due_Date__c', type: 'date', editable: true },
                                ]
    }
 }
 
 export { getConstants };
 