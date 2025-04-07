package customer.mysampleproject.ExcelMaker;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.FileOutputStream;
import java.util.List;
import java.util.Map;

@Component
public class ExcelGenerator {
    public static void generateExcel(List<ExcelSheetData> sheets, String outputFilePath) throws Exception {
        Workbook workbook = new XSSFWorkbook();

        for (ExcelSheetData sheetData : sheets) {
            Sheet sheet = workbook.createSheet(sheetData.getSheetName());

            // Create header row
            Row headerRow = sheet.createRow(0);
            List<String> columnOrder = ((ExcelSheetData) sheetData).getColumnOrder();
            Map<String, String> headers = sheetData.getColumnHeaders();

            for (int i = 0; i < columnOrder.size(); i++) {
                String key = columnOrder.get(i);
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.getOrDefault(key, key));
            }

            // Fill rows
            int rowNum = 1;
            for (Map<String, Object> rowData : sheetData.getRows()) {
                Row row = sheet.createRow(rowNum++);
                for (int i = 0; i < columnOrder.size(); i++) {
                    Object value = rowData.get(columnOrder.get(i));
                    Cell cell = row.createCell(i);
                    if (value instanceof Number) {
                        cell.setCellValue(((Number) value).doubleValue());
                    } else {
                        cell.setCellValue(value != null ? value.toString() : "");
                    }
                }
            }

            // Auto-size columns
            for (int i = 0; i < columnOrder.size(); i++) {
                sheet.autoSizeColumn(i);
            }
        }

        // Write to file
        try (FileOutputStream fileOut = new FileOutputStream(outputFilePath)) {
            workbook.write(fileOut);
        }
        workbook.close();
    }
}
