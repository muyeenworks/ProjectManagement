public with sharing class ProjectToDoController {

        /**
     * @Description: This method is used to get the count of Project Milestones.
     */
    @AuraEnabled(cacheable=true)
    public static Integer getTodoCount(Id milestoneId){
        return [SELECT COUNT() FROM Project_To_Do__c WHERE Project_Milestone__c = :milestoneId WITH USER_MODE];
    }
    
    /**
     * @Description: This method is used to get the project to do list.
     */
    @AuraEnabled(cacheable=true)
    public static List<Project_To_Do__c> getProjectToDoList(Id milestoneId,Integer offset){
        try {
            return [SELECT Id, Name, Project_Milestone__c, Status__c, Due_Date__c
                    FROM Project_To_Do__c
                    WHERE Project_Milestone__c = :milestoneId
                    WITH USER_MODE ORDER BY Createddate DESC LIMIT 5 OFFSET :offset];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}