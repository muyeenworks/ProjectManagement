@isTest
private class ProjectToDoControllerTest {

    @isTest
    static void myUnitTest() {
        Project__c prj =  TestFactory.createProject(true);
        Project_Milestone__c milestone = TestFactory.createMilestone(true,prj.Id);
        Project_To_Do__c toDo = TestFactory.createToDo(true,milestone.Id,'Not Started');
        System.Assert(ProjectToDoController.getTodoCount(milestone.Id)>0,'Count is not matching');
        System.Assert(!ProjectToDoController.getProjectToDoList(milestone.Id,0).isEmpty(),'List is empty');
        delete toDo;
        delete milestone;
        System.Assert(ProjectToDoController.getTodoCount(milestone.Id)==0,'Count is not matching');
        System.Assert(ProjectToDoController.getProjectToDoList(milestone.Id,0).isEmpty(),'List is not empty');
    }
}