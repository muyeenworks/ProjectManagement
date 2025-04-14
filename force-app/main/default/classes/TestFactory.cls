/**
 * Test Factory: To assist with creating test records for test classes 
 * */
@isTest
public class TestFactory {

    /**
     * Create a Project__c record with default values
     */
    public static Project__c createProject(Boolean create) {
        Project__c proj = new Project__c();
        proj.Name = 'Test Project';
        proj.description__c = 'Project Description';
        if(create){
            insert proj;
        }
        return proj;
    }

    /**
     * Create a Project_Milestone__c record with default values
     */
    public static Project_Milestone__c createMilestone(Boolean create,Id projectId) {
        Project_Milestone__c milestone = new Project_Milestone__c();
        milestone.Name = 'Test Milestone';
        milestone.Due_Date__c = Date.today().addDays(10);
        milestone.Project__c = projectId;
        if(create){
            insert milestone;
        }
        return milestone;
    }

    /**
     * Create Project_To_Do__c record with default values
     */
    public static Project_To_Do__c createToDo(Boolean create,Id milestoneId,String status) {
        Project_To_Do__c todo = new Project_To_Do__c();
        todo.Name = 'Test ToDo';
        todo.Status__c = status;
        todo.Due_Date__c = Date.today().addDays(10);
        todo.Project_Milestone__c = milestoneId;
        if(create){
            insert todo;
        }
        return todo;
    }
}