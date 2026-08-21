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
                if (key !== 'id') allKeys.add(key); // exclude internal ID
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

        return (await workbook.xlsx.writeBuffer()) as any;
    }
}
