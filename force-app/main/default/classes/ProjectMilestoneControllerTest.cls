@isTest
private class ProjectMilestoneControllerTest {

    @isTest
    static void myUnitTest() {
        Project__c prj =  TestFactory.createProject(true);
        TestFactory.createMilestone(true,prj.Id);
        System.Assert(ProjectMilestoneController.milestoneCount(prj.Id)>0,'Count is not matching');
        System.Assert(!ProjectMilestoneController.getProjectMilestoneList(prj.Id,0).isEmpty(),'List is empty');
    }
}