// TemplateLibrary Module
function GoogleTemplateLibrary() {
  const ui = SpreadsheetApp.getUi();

  // Private Functions
  function createTemplateSheet(assignment) {
    // Create configuration for the template sheet
    const { configSheet, logSheet } = Config().newConfig(assignment, {
      Task: 'Templates',
      TestDocId: '',
      FileNameMatch: '.*',
    });

    // Utilize row 4 onward for placeholder and replacement text
    configSheet.getRange(4, 1, 1, 2).setValues([['Placeholder', 'Replacement Text']]);
  }

  function applyTemplate(docId) {
  const config = Config().getConfig();
  if (!config) return;

  const doc = DocumentApp.openById(docId);
  const allTabs = getAllTabs(doc);
  const templateSheet = config.getConfigSheet();
  const templateData = templateSheet.getRange(4, 1, templateSheet.getLastRow() - 3, 2).getValues();

  // Function to replace text in a given DocumentTab
  function replaceTextInDocumentTab(documentTab) {
    if (!documentTab?.getBody) {
      console.info('Non-document tab???',documentTab);
      return;
    }
    let body = documentTab.getBody();
    // Iterate over all placeholders and replacements
    templateData.forEach(([placeholder, replacementText]) => {
      if (placeholder && replacementText) {
        body.replaceText(placeholder, replacementText);
      }
    });

     
  }

  // Iterate through all tabs and apply the replacements
  allTabs.forEach(tab => {
    const documentTab = tab.asDocumentTab();
    replaceTextInDocumentTab(documentTab);
  });

  const logSheet = config.getLogSheet();
  if (logSheet) {
    logSheet.appendRow([new Date(), 'Template applied', `https://docs.google.com/document/d/${docId}`]);
  }

  ui.alert('Template applied successfully.');
}

// Function to retrieve all tabs, including child tabs
function getAllTabs(doc) {
  const allTabs = [];
  // Iterate over all tabs and recursively add any child tabs to generate a flat list
  for (const tab of doc.getTabs()) {
    addCurrentAndChildTabs(tab, allTabs);
  }
  return allTabs;
}

// Helper function to add current and child tabs to the list
function addCurrentAndChildTabs(tab, allTabs) {
  allTabs.push(tab);
  for (const childTab of tab.getChildTabs()) {
    addCurrentAndChildTabs(childTab, allTabs);
  }
}


  function getMatchingAttachments(submissions, fileNameMatch) {
    return submissions.flatMap(submission => {
      if (submission.assignmentSubmission && submission.assignmentSubmission.attachments) {
        return submission.assignmentSubmission.attachments.filter(attachment => {
          return attachment.driveFile && new RegExp(fileNameMatch).test(attachment.driveFile.title);
        });
      }
      return [];
    });
  }

  // Public Functions
  function applyTemplateForAssignment() {
    const config = Config().getConfig();
    if (!config) return;

    const assignment = config.getAssignment();
    const submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(assignment.courseId, assignment.id).studentSubmissions;
    if (!submissions || submissions.length === 0) {
      ui.alert('No student submissions available for this assignment.');
      return;
    }

    const matchingAttachments = getMatchingAttachments(submissions, config.FileNameMatch);
    if (matchingAttachments.length === 0) {
      ui.alert('No matching student documents found.');
      return;
    }

    matchingAttachments.forEach(attachment => {
      const documentId = attachment.driveFile.id;
      applyTemplate(documentId);
    });

    ui.alert('Templates applied to all matching submissions.');
  }

  function testTemplate() {
    const config = Config().getConfig();
    if (!config) return;

    let testDocId = config.TestDocId;

    if (!testDocId) {
      const assignment = config.getAssignment();
      const submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(assignment.courseId, assignment.id).studentSubmissions;
      if (!submissions || submissions.length === 0) {
        ui.alert('No student submissions available for this assignment.');
        return;
      }

      const matchingAttachments = getMatchingAttachments(submissions, config.FileNameMatch);
      if (matchingAttachments.length > 0) {
        testDocId = matchingAttachments[0].driveFile.id;
        config.getConfigSheet().getRange('C2').setValue(testDocId); // Cache the test document ID for future reference
      } else {
        ui.alert('No matching student document found.');
        return;
      }
    }

    if (testDocId) {
      let scratchFolder = DriveApp.getFoldersByName(SCRATCH_FOLDER_NAME);
      if (!scratchFolder.hasNext()) {
        scratchFolder = DriveApp.createFolder(SCRATCH_FOLDER_NAME);
      } else {
        scratchFolder = scratchFolder.next();
      }

      const testDoc = DriveApp.getFileById(testDocId).makeCopy(`Test Copy - ${new Date().toISOString()}`, scratchFolder);
      applyTemplate(testDoc.getId());
      ui.alert('Test template applied successfully. View the result here: ' + testDoc.getUrl());
      config.getLogSheet().appendRow(["Applied Template",testDoc.getUrl(),new Date()])
    }
  }

  return {
    createTemplateSheet,
    applyTemplateForAssignment,
    testTemplate
  };
}

// Function hooks for menu
function createTemplateSheet() {
  const classroom = GoogleClassroomPicker().getClassroom();
  if (!classroom) return;

  const assignment = GoogleAssignmentPicker().getAssignment();
  if (!assignment) return;

  GoogleTemplateLibrary().createTemplateSheet(assignment);
}

function applyTemplateForAssignment() {
  GoogleTemplateLibrary().applyTemplateForAssignment();
}

function testTemplate() {
  GoogleTemplateLibrary().testTemplate();
}
