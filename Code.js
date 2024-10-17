/**
 * Google Doc Assessment Manager
 * This tool is meant to help with the process of creating assessments based on code.
 * For now, we will have the following functionality:
 * 
 * Classroom
 * - Pick a google classroom (we'll remember it for the future)
 * - Pick an assignment (we'll remember that too)
 * - Manage the google docs associated with an assignment using this script, possibly matching on title.
 * 
 * Templates
 * - For all documents attached to chosen assignment which match a regexp, we can...
 * - Insert template text (basically find/replace text).
 * - This can run from a configuration spreadsheet
 * 
 * Grade Summaries from Chips
 * - We can automatically harvest "chip" grades based on headers and output them in a spreadsheet.
 * 
 * 
 * Patterns:
 * - We will use a "run script from this sheet" pattern to handle actions.
 * - The given sheet will have configuration data for one of our tasks (templates or grades)
 * - We will run everything with a menu.
 * - Because tasks will likely have both a settings template *and* a logging template,
 *   we we probably want a set of paired sheets. The easiest thing to do would be to create
 *   both when we create a sheet, and then to store the ID of the sheet in the settings and
 *   also in a property for quick lookup. Then if I run a task either from the setting or the
 *   log sheet for the task, it will know which task I want to run.
 * 
 * Files: 
 * - ClassroomPicker - interface for choosing Google Classroom
 *     Public Method: getClassroom (gets classroom from user)
 * - ClassroomAssignments - interface for choosing Assignment
 *     Public Method: getAssignment (gets assignment from user)
 * - Templates - interface for setting up and generating a template
 *     Public Methods: 
 *     - createTemplateSheet : prompts user for class/assignment
 *       and then creates a template configuration sheet which has
 *       data we need.
 *     - applyTemplate - run from a template sheet, will update template
 *       as needed.
 * - Grades - interface for summarizing grades for an assignment.
 *     Public Methods:
 *     - createGradeSheet - create a sheet for grading as assignment with
 *       configuration data -- basically, we are extracting some information
 *       based on a cheerio match, so we'd want something like a querySelector
 *       match.
 *     - harvestGrades - goes and grabs the grades from a document.
 * 
 * Future directions:
 * - In the future, we may want to actually *create* the google classroom assessment ourselves,
 *   in which case we could then manage grades in classroom (we can't manage grades for an assessment
 *   we didn't create due to a limitation in GAS).
 * - We may want to add more grading conveniences and possibly inject a script onto each document
 *   to make it easy to i.e. update total grades based on points in the document etc.
 */