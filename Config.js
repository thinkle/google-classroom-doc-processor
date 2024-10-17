// Config Module
const CONFIG_SUFFIX = '_TemplateConfig';
const LOG_SUFFIX = '_TemplateLog';
const SCRATCH_FOLDER_NAME = 'Google Assignment Tool Scratch Documents';

function Config() {
  const ui = SpreadsheetApp.getUi();
  const cache = CacheService.getDocumentCache();

  // Utility function to get a sheet by its ID
  function getSheetById(spreadsheet, sheetId) {
    return spreadsheet.getSheets().find(sheet => sheet.getSheetId() == sheetId);
  }

  // Public Methods
  function newConfig(assignment, configData) {
    if (!assignment) {
      throw new Error('Invalid configuration data: Assignment information is missing.');
    }
    const assignmentName = assignment.title;
    const abbreviatedAssignmentName = assignmentName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    let sheetIndex = 1;
    let configSheetName;
    let logSheetName;

    // Ensure unique sheet names
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    do {
      configSheetName = `${abbreviatedAssignmentName}_${sheetIndex}${CONFIG_SUFFIX}`;
      logSheetName = `${abbreviatedAssignmentName}_${sheetIndex}${LOG_SUFFIX}`;
      sheetIndex++;
    } while (spreadsheet.getSheetByName(configSheetName) || spreadsheet.getSheetByName(logSheetName));

    // Create new config sheet and log sheet
    const configSheet = spreadsheet.insertSheet(configSheetName);
    const logSheet = spreadsheet.insertSheet(logSheetName);

    // Set headers for config sheet
    const fullConfigData = {
      ClassroomId: assignment.courseId,
      AssignmentId: assignment.id,
      LogSheetId : logSheet.getSheetId(),
      ...configData
    };
    configSheet.appendRow(Object.keys(fullConfigData));
    configSheet.appendRow(Object.values(fullConfigData));
    configSheet.appendRow(['']); // Blank row to separate main config from task-specific data - appendRow requires a non-empty array    

    // Store the link between the log sheet and the config sheet
    PropertiesService.getDocumentProperties().setProperty(logSheet.getSheetId(), configSheet.getSheetId());

    ui.alert(`Configuration and log sheets created for assignment: ${assignmentName}`);
    return {
      configSheet,
      logSheet,
      getAssignment: () => assignment
    };
  }

  function getConfig() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = spreadsheet.getActiveSheet();
    const properties = PropertiesService.getDocumentProperties();
    let configObject = {};
    let configSheet;

    if (activeSheet.getName().endsWith(CONFIG_SUFFIX)) {
      console.log('Configuration sheet detected.');
      configSheet = activeSheet;
      const configData = configSheet.getRange(1, 1, 2, configSheet.getLastColumn()).getValues();
      configData[0].forEach((header, index) => {
        configObject[header] = configData[1][index];
      });
    } else if (activeSheet.getName().endsWith(LOG_SUFFIX)) {
      console.log('Log sheet detected.');
      const configSheetId = properties.getProperty(activeSheet.getSheetId());
      if (configSheetId) {
        configSheet = getSheetById(spreadsheet, configSheetId);
        if (configSheet) {
          const configData = configSheet.getRange(1, 1, 2, configSheet.getLastColumn()).getValues();
          configData[0].forEach((header, index) => {
            configObject[header] = configData[1][index];
          });
        }
      }
    } else {
      ui.alert('No valid configuration found. Please run this function from a configuration or log sheet.');
      return null;
    }

    // Add helper methods for getting sheets and assignment
    return {
      ...configObject,
      getLogSheet: () => getSheetById(spreadsheet, configObject.LogSheetId),
      getConfigSheet: () => configSheet,
      getAssignment: () => {
        const classroomService = Classroom.Courses.CourseWork;
        if (!configObject.ClassroomId || !configObject.AssignmentId) {
          throw new Error('ClassroomId or AssignmentId is missing from the configuration.');
        }
        try {
          const assignment = classroomService.get(configObject.ClassroomId, configObject.AssignmentId);
          return assignment;
        } catch (e) {
          console.error('Failed to fetch assignment from Google Classroom:', e);
          throw new Error('Could not fetch assignment from Google Classroom. Please check your ClassroomId and AssignmentId.');
        }
      }
    };
  }

  return {
    newConfig,
    getConfig
  };
}

function testConfig () {
  Config().getConfig().getLogSheet().appendRow(['Hello World']);
}
