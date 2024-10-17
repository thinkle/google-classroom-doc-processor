// AssignmentPicker Module
function GoogleAssignmentPicker() {
  const cache = CacheService.getDocumentCache();
  const ui = SpreadsheetApp.getUi();

  // Private Functions
  function promptAssignmentSelection(classroom) {
    const assignments = Classroom.Courses.CourseWork.list(classroom.id).courseWork;
    
    if (!assignments || assignments.length === 0) {
      Logger.log('No available assignments for this classroom.');
      return null;
    }

    const assignmentNames = assignments.map((assignment, index) => `${index + 1}. ${assignment.title}`).join('\n');
    const promptMessage = `Select an Assignment for classroom: ${classroom.name} by typing the corresponding number (type -1 to change classroom):\n\n` + assignmentNames;
    const response = ui.prompt('Select Assignment', promptMessage, ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() == ui.Button.CANCEL) {
      Logger.log('Selection canceled by user.');
      return null;
    }
    const selectedIndex = parseInt(response.getResponseText(), 10) - 1;

    if (selectedIndex === -2) {
      cache.remove('selectedClassroomId');
      Logger.log('Classroom selection cleared.');
      const newClassroom = GoogleClassroomPicker().getClassroom();
      if (newClassroom) {
        return promptAssignmentSelection(newClassroom);
      } else {
        return null;
      }
    } else if (selectedIndex >= 0 && selectedIndex < assignments.length) {
      const selectedAssignment = assignments[selectedIndex];
      cache.put('selectedAssignmentId', selectedAssignment.id); // Cache indefinitely
      return selectedAssignment;
    } else {
      Logger.log('Invalid selection.');
      return null;
    }
  }

  // Public Function
  function getAssignment() {
    let cachedAssignmentId = cache.get('selectedAssignmentId');
    const cachedClassroomId = cache.get('selectedClassroomId');

    if (cachedAssignmentId && cachedClassroomId) {
      Logger.log('Using cached assignment ID.');
      return Classroom.Courses.CourseWork.get(cachedClassroomId, cachedAssignmentId);
    } else {
      const classroom = GoogleClassroomPicker().getClassroom();
      if (classroom) {
        return promptAssignmentSelection(classroom);
      } else {
        return null;
      }
    }
  }

  return { getAssignment };
}

function getAssignment() {
  return GoogleAssignmentPicker().getAssignment();
}