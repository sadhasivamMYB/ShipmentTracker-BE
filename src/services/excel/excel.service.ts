import exceljs from "exceljs";

export class ExcelService {
    static async generateExcelBuffer(data: any): Promise<any> {
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("Monthly Summary");

        if (data.length === 0) {
            worksheet.addRow(["No data available"]);
            return (await workbook.xlsx.writeBuffer()) as any;
        }

        // Get all dynamic keys across all rows for columns
        const allKeys = new Set<string>();
        data.forEach((row: any) => {
            Object.keys(row).forEach(key => {
                if (!['workspaceId', 'createdAt', 'updatedAt', 'id'].includes(key)) {
                    allKeys.add(key); // exclude internal ID
                }
            });
        });

        // Ensure PFI Number is first
        const columns = Array.from(allKeys);
        if (columns.includes('pfiNumber')) {
            columns.splice(columns.indexOf('pfiNumber'), 1);
            columns.unshift('pfiNumber');
        }

        worksheet.columns = columns.map(col => ({
            header: col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1'),
            key: col,
            width: 20
        }));

        worksheet.addRows(data);

        ExcelService.mergeRepeatedValues(worksheet, 2, worksheet.rowCount);

        return (await workbook.xlsx.writeBuffer()) as any;
    }

    /**
     * Merges cells in all columns for rows that are grouped by the primary identifier (pfiNumber).
     * If all values in a column for a given group are identical, they are merged.
     * @param worksheet The ExcelJS worksheet.
     * @param startRow The starting row index (1-based, usually 2 to skip headers).
     * @param endRow The ending row index (1-based).
     */
    static mergeRepeatedValues(worksheet: exceljs.Worksheet, startRow: number, endRow: number) {
        const getCellValueString = (value: exceljs.CellValue): string => {
            if (value === null || value === undefined) return "";
            if (typeof value === "object") {
                if (value instanceof Date) return value.toISOString();
                if ("text" in value) return String(value.text);
                if ("result" in value) return String(value.result);
                return JSON.stringify(value);
            }
            return String(value).trim();
        };

        // Determine the column to group by (preferably 'pfiNumber', otherwise the first column)
        let groupByColNumber = 1;
        const pfiCol = worksheet.getColumn('pfiNumber');
        if (pfiCol && pfiCol.number) {
            groupByColNumber = pfiCol.number;
        }

        let blockStartRow = startRow;

        const processBlock = (start: number, end: number) => {
            if (end <= start) return; // No need to merge a single row

            const colCount = worksheet.columns?.length || 0;
            for (let col = 1; col <= colCount; col++) {
                const firstVal = getCellValueString(worksheet.getCell(start, col).value);
                if (firstVal === "") continue; // Do not merge empty strings

                let shouldMerge = true;
                for (let r = start + 1; r <= end; r++) {
                    const cellVal = getCellValueString(worksheet.getCell(r, col).value);
                    // We merge if the subsequent rows have the exact same value OR are empty (null in data)
                    if (cellVal !== "" && cellVal !== firstVal) {
                        shouldMerge = false;
                        break;
                    }
                }

                if (shouldMerge) {
                    worksheet.mergeCells(start, col, end, col);
                    const mergedCell = worksheet.getCell(start, col);
                    mergedCell.alignment = {
                        ...mergedCell.alignment,
                        vertical: 'middle',
                        horizontal: 'center'
                    };
                }
            }
        };

        for (let row = startRow + 1; row <= endRow; row++) {
            const groupVal = getCellValueString(worksheet.getCell(row, groupByColNumber).value);
            // A non-empty value in the grouping column indicates the start of a new primary record block
            if (groupVal !== "") {
                processBlock(blockStartRow, row - 1);
                blockStartRow = row;
            }
        }

        // Handle the final block at the end of the file
        processBlock(blockStartRow, endRow);
    }
}
