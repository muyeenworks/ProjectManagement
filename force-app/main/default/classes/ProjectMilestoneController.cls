/**
 * @Description: This class is used as a controller for the projectMilestone LWC.
 * @Created date : 
 * @Created By : 
 */
public with sharing class ProjectMilestoneController {

    /**
     * @Description: This method is used to get the count of Project Milestones.
     */
    @AuraEnabled(cacheable=true)
    public static Integer milestoneCount(Id projectId){
        try {
            return [SELECT COUNT() FROM Project_Milestone__c WHERE Project__c = :projectId WITH USER_MODE];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Project_Milestone__c> getProjectMilestoneList(Id projectId,Integer offset){
        try {
            System.debug(projectId+' '+offset);
            List<Project_Milestone__c> lstPrjMilestones = new List<Project_Milestone__c>();
            for(Project_Milestone__c prj:[SELECT Id, Name , Complete__c,  Project__c, Status__c
            FROM Project_Milestone__c
            WHERE Project__c = :projectId
            WITH USER_MODE ORDER BY CreatedDate DESC LIMIT 5 OFFSET:offset] ){
                prj.Complete__c = prj.Complete__c !=null ? prj.Complete__c/100 : prj.Complete__c;
                lstPrjMilestones.add(prj);
            }
            return lstPrjMilestones;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}