trigger ProjectToDoTrigger on Project_To_Do__c (after delete) {
    Map<Id,Project_Milestone__c> prjMilestoneMap = new Map<Id,Project_Milestone__c>();
    for(Project_To_Do__c toDo:Trigger.old){
        prjMilestoneMap.put(toDo.Project_Milestone__c,new Project_Milestone__c(Id=toDo.Project_Milestone__c));
    }
    update prjMilestoneMap.values();
}