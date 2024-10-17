function getSheetById(spreadsheet, sheetId) {
  return spreadsheet.getSheets().find(sheet => sheet.getSheetId() == sheetId);
}