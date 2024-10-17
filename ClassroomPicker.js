// ClassroomPicker Module
function GoogleClassroomPicker() {
  const cache = CacheService.getDocumentCache();
  const ui = SpreadsheetApp.getUi();

  // Private Functions
  function promptClassroomSelection() {
    const classrooms = Classroom.Courses.list({
      teacherId: 'me',
      courseStates: ['ACTIVE']
    }).courses;
    
    if (!classrooms || classrooms.length === 0) {
      Logger.log('No available classrooms.');
      return null;
    }

    const classroomNames = classrooms.map((course, index) => `${index + 1}. ${course.name}`).join('\n');
    const promptMessage = 'Select a Google Classroom by typing the corresponding number (type -1 to clear selection):\n\n' + classroomNames;
    const response = ui.prompt('Select Classroom', promptMessage, ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() == ui.Button.CANCEL) {
      Logger.log('Selection canceled by user.');
      return null;
    }
    const selectedIndex = parseInt(response.getResponseText(), 10) - 1;
    
    if (selectedIndex === -2) {
      cache.remove('selectedClassroomId');
      Logger.log('Classroom selection cleared.');
      return promptClassroomSelection();
    } else if (selectedIndex >= 0 && selectedIndex < classrooms.length) {
      const selectedClassroom = classrooms[selectedIndex];
      cache.put('selectedClassroomId', selectedClassroom.id); // Cache indefinitely
      return selectedClassroom;
    } else {
      Logger.log('Invalid selection.');
      return null;
    }
  }

  // Public Function
  function getClassroom() {
    let cachedClassroomId = cache.get('selectedClassroomId');
    if (cachedClassroomId) {
      Logger.log('Using cached classroom ID.');
      return Classroom.Courses.get(cachedClassroomId);
    } else {
      return promptClassroomSelection();
    }
  }

  return { getClassroom };
}

function getClassroom() {
  return GoogleClassroomPicker().getClassroom();
}