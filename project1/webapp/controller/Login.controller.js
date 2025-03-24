sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",

	"sap/m/MessageBox",
	"sap/ui/core/routing/History",

], (Controller, JSONModel, MessageBox, ErrorMessage) => {
	"use strict";

	return Controller.extend("project1.controller.Login", {
		onInit() {
			console.log("hello view");
		},
		handleNav: function (evt) {
			var navCon = this.byId("navCon");
			var target = evt.getSource().data("target");
			if (target) {
				var animation = this.byId("animationSelect").getSelectedKey();
				navCon.to(this.byId(target), animation);
			} else {
				navCon.back();
			}
		},

		// start the excel
		onPressTemplateDownload: async function () {
			const companyData = [
				{ code: 'C001', name: 'Alpha Corp', currency: 'USD' },
				{ code: 'C002', name: 'Beta Ltd', currency: 'EUR' },
				{ code: 'C003', name: 'Gamma Inc', currency: 'GBP' },
				{ code: 'C004', name: 'Delta LLC', currency: 'AUD' },
				{ code: 'C005', name: 'Epsilon SA', currency: 'CAD' }
			];

			const productData = [
				{ productId: 'P001', description: 'Product A' },
				{ productId: 'P002', description: 'Product B' },
				{ productId: 'P003', description: 'Product C' },
				{ productId: 'P004', description: 'Product D' },
				{ productId: 'P005', description: 'Product E' }
			];

			this.getView().setModel(new JSONModel({ companyNames: companyData, products: productData }), "excelDataMdl");

			try {
				const wb = new ExcelJS.Workbook();

				// Create worksheets
				const bulkUploadTemplateSH = wb.addWorksheet('Bulk Upload Template', { properties: { tabColor: { argb: 'ADD8E6' } } });
				const companyNamesSH = wb.addWorksheet('Company Names', { properties: { tabColor: { argb: 'ADD8E6' } } });
				const productsSH = wb.addWorksheet('Products', { properties: { tabColor: { argb: 'ADD8E6' } } });

				// Define columns
				companyNamesSH.columns = [
					{ header: 'Company Code', key: 'code', width: 10 },
					{ header: 'Company Name', key: 'name', width: 20 },
					{ header: 'Currency', key: 'currency', width: 10 }
				];
				productsSH.columns = [
					{ header: 'Product ID', key: 'productId', width: 10 },
					{ header: 'Description', key: 'description', width: 20 }
				];

				// Track the Progress using a Dialog
				
					let progressDialog = new sap.m.Dialog({
						title: "Generating Excel",
						type: "Message",
						content: new sap.m.VBox({
							items: [
								new sap.m.Text({ id: "progressText", text: "Processing sheet 0/2" }),
								new sap.m.ProgressIndicator({
									id: "progressBar",
									width: "100%",
									percentValue: 0,
									displayValue: "0%",
									showValue: true,
									displayAnimation: true,
									displayOnly:true
								})
							]
						}),
						endButton: new sap.m.Button({
							text: "Cancel",
							press: function () {
								progressDialog.close();
								return;
							}
						})
					});
					this.getView().addDependent(progressDialog);
				
				this._progressDialog = await progressDialog.open();
				
				// Get Progress Components
				let progressText = sap.ui.getCore().byId("progressText");
				let progressBar = sap.ui.getCore().byId("progressBar");

				// Load Company Names Sheet
				companyData.forEach(item => companyNamesSH.addRow(item));
				await this._updateProgress(progressText, progressBar, "Loading Companies 1/2", 50);

				// Load Products Sheet
				productData.forEach(item => productsSH.addRow(item));
				await this._updateProgress(progressText, progressBar, "Loading Products 2/2", 80);

				// Apply Excel Validations
				this.createExcelValidations(bulkUploadTemplateSH, 100);

				// Write and Download the Excel file
				const buffer = await wb.xlsx.writeBuffer();
				const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = 'BulkUploadTemplate.xlsx';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				// Completion Message
				await this._updateProgress(progressText, progressBar, "Completed 2/2", 100);
				await new Promise(resolve => setTimeout(resolve, 1500));

				this._progressDialog.close();
				MessageToast.show("Bulk upload template downloaded!");
			} catch (error) {
				if (this._progressDialog) {
					this._progressDialog.close();
					this._progressDialog.destroy();
				 }
				console.error("Error generating Excel file:", error);
				this.errorHandling(error);
			}
		},

		/**
		 * Update progress bar and text with a delay.
		 */
		_updateProgress: async function (progressText, progressBar, message, percentage) {
			progressText.setText(message);
			progressBar.setPercentValue(percentage);
			progressBar.setDisplayValue(percentage + "%");
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating loading delay
		},



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
		//end of Excel









	});
});