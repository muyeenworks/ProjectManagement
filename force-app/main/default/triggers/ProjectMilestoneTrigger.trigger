trigger ProjectMilestoneTrigger on Project_Milestone__c (after delete) {
    Map<Id,Project__c> prjMap = new Map<Id,Project__c>();
    for(Project_Milestone__c milestone:Trigger.old){
        prjMap.put(milestone.Project__c,new Project__c(Id=milestone.Project__c));
    }
    update prjMap.values();
}