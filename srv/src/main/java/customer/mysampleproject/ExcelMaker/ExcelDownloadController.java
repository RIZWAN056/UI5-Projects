package customer.mysampleproject.ExcelMaker;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
public class ExcelDownloadController {

    @Autowired
    private ExcelGenerator excelGenerator;

    /**
     * Downloads a basic example Excel file to the browser
     */
    @GetMapping("/download/excel")
    public ResponseEntity<byte[]> downloadExcel() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Example Sheet");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Name");
        header.createCell(1).setCellValue("Age");

        Row data = sheet.createRow(1);
        data.createCell(0).setCellValue("Alice");
        data.createCell(1).setCellValue(30);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=example.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(out.toByteArray());
    }

    /**
     * Generates Excel file and saves it to the user's Downloads folder
     */
    @GetMapping("/generate/excel")
    public void downloadExcelTemplate(HttpServletResponse response) {
        try {
            // Sheet 1: Companies
            ExcelSheetData companySheet = ExcelSheetData.builder()
                    .sheetName("Companies")
                    .columnOrder(List.of("code", "name", "currency"))
                    .columnHeaders(Map.of(
                            "code", "Company Code",
                            "name", "Company Name",
                            "currency", "Currency"))
                    .rows(List.of(
                            Map.of("code", "C001", "name", "Alpha Corp", "currency", "USD"),
                            Map.of("code", "C002", "name", "Beta Ltd", "currency", "EUR"),
                            Map.of("code", "C003", "name", "Gamma Inc", "currency", "GBP")))
                    .build();

            // Sheet 2: Products
            ExcelSheetData productSheet = ExcelSheetData.builder()
                    .sheetName("Products")
                    .columnOrder(List.of("productId", "description"))
                    .columnHeaders(Map.of(
                            "productId", "Product ID",
                            "description", "Description"))
                    .rows(List.of(
                            Map.of("productId", "P001", "description", "Product A"),
                            Map.of("productId", "P002", "description", "Product B")))
                    .build();

            List<ExcelSheetData> sheets = List.of(companySheet, productSheet);

            // Save to Downloads folder
            String downloadPath = Paths
                    .get(System.getProperty("user.home"), "Downloads", "BulkUploadFromJavaTemplate.xlsx")
                    .toString();

            excelGenerator.generateExcel(sheets, downloadPath);

            response.setContentType("text/plain");
            response.getWriter().write("Excel file generated at: " + downloadPath);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
