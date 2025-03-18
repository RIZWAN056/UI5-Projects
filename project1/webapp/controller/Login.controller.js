sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",

    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
   
], (Controller,JSONModel,MessageBox,ErrorMessage) => {
    "use strict";

    return Controller.extend("project1.controller.Login", {
        onInit() {
            console.log("hello view" );
        },
        handleNav: function(evt) {
			var navCon = this.byId("navCon");
			var target = evt.getSource().data("target");
			if (target) {
				var animation = this.byId("animationSelect").getSelectedKey();
				navCon.to(this.byId(target), animation);
			} else {
				navCon.back();
			}
		},
		
		onPressTemplateDownload: async function () {
			const companyData = [
			  { code: 'C001', name: 'Alpha Corp', currency: 'USD' },
			  { code: 'C002', name: 'Beta Ltd', currency: 'EUR' },
			  { code: 'C003', name: 'Gamma Inc', currency: 'GBP' },
			  { code: 'C004', name: 'Delta LLC', currency: 'AUD' },
			  { code: 'C005', name: 'Epsilon SA', currency: 'CAD' }
			];

			let obj={
				companyNames:companyData
			}
			
			this.getView().setModel(new JSONModel(obj),"excelDataMdl");
		  
			try {
			  const wb = new ExcelJS.Workbook();
		  
			  // Create worksheets
			  const bulkUploadTemplateSH = wb.addWorksheet('Bulk Upload Template', {
				properties: { tabColor: { argb: 'ADD8E6' } },
			  });
			  const companyNamesSH = wb.addWorksheet('Company Names', {
				properties: { tabColor: { argb: 'ADD8E6' } },
			  });
		  
			  // Define columns for bulk upload template
			  bulkUploadTemplateSH.columns = [
				{ header: 'Company', key: 'company', width: 20 },
				{ header: 'Property Name', key: 'name', width: 20 },
				{ header: 'Description', key: 'description', width: 15 },
				{ header: 'Property Type', key: 'propertyType', width: 15 },
				{ header: 'Listing Type', key: 'listingType', width: 15 },
				{ header: 'Unit Name', key: 'unitName', width: 15 },
				{ header: 'Occupancy', key: 'occupancy', width: 15 },
				{ header: 'Status', key: 'status', width: 15 },
				{ header: 'Size', key: 'size', width: 10 },
				{ header: 'Size UOM', key: 'sizeUom', width: 10 },
				{ header: 'Total Area', key: 'totalArea', width: 12 },
				{ header: 'Total Area UOM', key: 'totalAreaUom', width: 12 },
				{ header: 'Currency Rate', key: 'rateCurrency', width: 15 },
				{ header: 'Rate', key: 'rate', width: 15 },
				{ header: 'Unit Rate', key: 'unitRate', width: 15 },
				{ header: 'Vat Type', key: 'vatType', width: 15 },
				{ header: 'House No', key: 'houseNo', width: 12 },
				{ header: 'Address Line 1', key: 'addressLine1', width: 20 },
				{ header: 'Address Line 2', key: 'addressLine2', width: 20 },
				{ header: 'Street', key: 'street', width: 15 },
				{ header: 'City', key: 'city', width: 15 },
				{ header: 'Country', key: 'country', width: 15 },
				{ header: 'Region', key: 'region', width: 15 },
				{ header: 'Zip Code', key: 'zipCode', width: 10 },
				{ header: 'Phone', key: 'phone', width: 15 },
				{ header: 'Fax', key: 'fax', width: 15 },
				{ header: 'Mobile', key: 'mobile', width: 15 },
				{ header: 'Email', key: 'email', width: 25 },
				{ header: 'Website', key: 'website', width: 25 },
				{ header: 'Electricity Code', key: 'electricityCode', width: 20 },
				{ header: 'Gas Connection Code', key: 'gasConnectionCode', width: 20 },
				{ header: 'Water Connection Code', key: 'waterConnectionCode', width: 20 },
				{ header: 'A/C Code', key: 'acCode', width: 15 },
				{ header: 'Cost Center', key: 'costCenter', width: 15 },
				{ header: 'Longitude', key: 'longitude', width: 15 },
				{ header: 'Latitude', key: 'latitude', width: 15 }
			  ];
		  
			  // Define columns for company names sheet
			  companyNamesSH.columns = [
				{ header: 'Company Code', key: 'code', width: 10 },
				{ header: 'Company Name', key: 'name', width: 20 },
				{ header: 'Currency', key: 'currency', width: 10 }
			  ];
		  
			  // Load data into company names sheet
			  companyData.forEach(item => companyNamesSH.addRow(item));
		  
			  // Apply Excel Validations
			  this.createExcelValidations(bulkUploadTemplateSH, 100);
		  
			  // Write the Excel file
			  const buffer = await wb.xlsx.writeBuffer();
			  const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
			  });
		  
			  // Trigger download
			  const link = document.createElement('a');
			  link.href = URL.createObjectURL(blob);
			  link.download = 'BulkUploadTemplate.xlsx';
			  document.body.appendChild(link);
			  link.click();
			  document.body.removeChild(link);
		  
			  MessageToast.show("Bulk upload template downloaded!");
			} catch (error) {
			  console.error("Error generating Excel file:", error);
			  this.errorHandling(error);
			}
		  },
		  





			//end
		  
		  createExcelValidations: function (mainSH, exCount, exItemsCharges) {
			let sheetMdl = this.getView().getModel("excelDataMdl");
			let sheetData = sheetMdl.getData();
			// Make header row bold
			mainSH.getRow(1).font = { bold: true };
			mainSH.getRow(1).fill = {
			  type: 'pattern',
			  pattern: 'solid',
			  fgColor: { argb: 'FF00B050' } // Green background
			};
			// Function to apply validations to a column
			const applyValidation = (
			  sheetName, valueCount, valueFrom, valueTo, type,
			  allowBlank = false, errorStyle, promptTitle, prompt, customFormula = null
			) => {
			  const formulae = sheetName
				? `'${sheetName}'!$${valueFrom}$2:$${valueFrom}$${valueCount + 1}`
				: null;
			  const validation = {
				type,
				allowBlank,
				formulae: formulae ? [formulae] : undefined,
				showErrorMessage: !!errorStyle,
				errorStyle,
				errorTitle: "Invalid Input",
				error: prompt,
				promptTitle,
				prompt,
			  };
  
			  for (let row = 2; row <= exCount + 20; row++) {
				const cell = mainSH.getCell(`${valueTo}${row}`);
				const newFormula = customFormula;
				if (newFormula) {
				  cell.value = { formula: newFormula.replaceAll("{row}", row) };
				  if (valueTo == 'C' || valueTo == 'D') {//Always unlocked cells
					cell.protection = { locked: false }; // unLock the cell
				  }
				  else {
					cell.protection = { locked: true }; // Lock the cell  
					cell.fill = {
					  type: 'pattern',
					  pattern: 'solid',
					  fgColor: { argb: 'D3D3D3' }, // Light gray color
					};
				  }
				} else {
				  cell.protection = { locked: false }; // unLock the cell
				}
				if (type === 'decimal' && valueTo != 'C') {//incase of decimal format should be followed
				  cell.numFmt = '0.00';
  
				}
				cell.dataValidation = validation;
  
				// Common styling
				cell.font = { name: 'Times New Roman', size: 10 };
				cell.border = {
				  top: { style: 'thin', color: { argb: 'FF000000' } },
				  left: { style: 'thin', color: { argb: 'FF000000' } },
				  bottom: { style: 'thin', color: { argb: 'FF000000' } },
				  right: { style: 'thin', color: { argb: 'FF000000' } },
				};
				cell.alignment = {
				  wrapText: true,
				  horizontal: type === "decimal" ? 'right' : 'left',
				  vertical: 'bottom',
				};
			  }
			};
			let customListingFormula = "";
			if (this._type == 2) {//sale
			  customListingFormula = `=IF(A{row} <> "", IFERROR('Listing Type'!B2, ""), "")`
			} else {
			  customListingFormula = `=IF(A{row} <> "", IFERROR('Listing Type'!B3, ""), "")`
			}
			// sheetName, valueCount, valueFrom, valueTo, type, allowBlank, errorStyle, promptTitle, prompt, customExcelFormula
			applyValidation('Company Names', sheetData.companyNames.length || 1, 'B', 'A', 'list', false, 'stop', 'Description', 'Please choose the correct Item', null);
			
  
		  },










    });
});