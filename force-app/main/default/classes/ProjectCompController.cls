/**
 * @Description: This class is used as a controller for the projectComp LWC.
 * @Created date : 
 * @Created By : 
 */
public with sharing class ProjectCompController {

    /**
     * @Description: This method is used to get the count of projects.
     */
    @AuraEnabled(cacheable=true)
    public static Integer projectCount(){
        try {
            return [SELECT COUNT() FROM Project__c WITH USER_MODE];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @Description: This method is used to get the projects.
     */
    @AuraEnabled(cacheable=true)
    public static  List<ProjectDetails> getProjects(Integer offset){
        try {
            List<ProjectDetails> projects = new List<ProjectDetails>();
            for(Project__c prj:[SELECT Id, Name, Owner.Name, Status__c, CreatedDate,Complete__c, Description__c FROM Project__c WITH USER_MODE ORDER BY CreatedDate DESC LIMIT 5 OFFSET :offset]){
                ProjectDetails prjDetail = new ProjectDetails();
                prjDetail.projectName = prj.Name;
                prjDetail.projectOwner = prj.Owner.Name;
                prjDetail.projectStatus = prj.Status__c;
                prjDetail.projectCreatedDate = prj.CreatedDate;
                prjDetail.projectId = prj.Id;
                prjDetail.projectComplete = prj.Complete__c !=null ? prj.Complete__c / 100 : 0;
                prjDetail.projectDescription = prj.Description__c;
                projects.add(prjDetail);
            }
            return projects;
        }catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class ProjectDetails{
        @AuraEnabled
        public String projectName;
        @AuraEnabled
        public String projectOwner;
        @AuraEnabled
        public String projectStatus;
        @AuraEnabled
        public DateTime projectCreatedDate;
        @AuraEnabled
        public String projectId;
        @AuraEnabled
        public Decimal projectComplete;
        @AuraEnabled
        public String projectDescription;
    }
}