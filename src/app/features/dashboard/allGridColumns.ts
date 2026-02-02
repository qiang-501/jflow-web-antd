// Grid columns configuration for dashboard
import { TranslateService } from '@ngx-translate/core';

export async function allColumns(translate: TranslateService) {
  return [
    {
      field: 'id',
      headerName: await translate.get('ID').toPromise(),
      width: 80,
    },
    {
      field: 'name',
      headerName: await translate.get('Name').toPromise(),
      width: 200,
    },
    {
      field: 'status',
      headerName: await translate.get('Status').toPromise(),
      width: 120,
    },
    {
      field: 'priority',
      headerName: await translate.get('Priority').toPromise(),
      width: 120,
    },
    {
      field: 'createdAt',
      headerName: await translate.get('Created At').toPromise(),
      width: 180,
    },
    {
      field: 'updatedAt',
      headerName: await translate.get('Updated At').toPromise(),
      width: 180,
    },
  ];
}

export const allGridColumns = {
  // Add more column configurations as needed
};
