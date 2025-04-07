package customer.mysampleproject.ExcelMaker;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExcelSheetData {
    private String sheetName;
    private List<String> columnOrder; // The order of columns (keys)
    private Map<String, String> columnHeaders; // key -> Header title
    private List<Map<String, Object>> rows; // Each row is a map of columnKey -> value

    // New: Map columnKey -> dataType ("text", "number", "date", etc.)
    private Map<String, String> columnTypes;

    // New: Map columnKey -> list of allowed values (for dropdown validation)
    private Map<String, List<String>> columnValidations;
}
