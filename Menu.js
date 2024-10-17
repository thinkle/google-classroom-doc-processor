// Menu Setup
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Assessment Manager')
    .addItem('Pick Classroom', 'getClassroom')
    .addItem('Pick Assignment', 'getAssignment')
    // Menu Setup
    .addSeparator()
    .addItem('Create Template Sheet', 'createTemplateSheet')
    .addItem('Apply Template', 'applyTemplate')
    .addItem('Test Template', 'testTemplate')
    .addToUi();
}

