@isTest
private class ProjectCompControllerTest {

    @isTest
    static void myUnitTest() {
        TestFactory.createProject(true);
        System.assert(ProjectCompController.projectCount()>0,'Count is not matching');
        System.assert(!ProjectCompController.getProjects(Integer.valueOf(0)).isEmpty(),'List is empty');
    }
}