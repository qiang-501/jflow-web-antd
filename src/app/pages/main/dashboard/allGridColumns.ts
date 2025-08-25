import { ColDef } from 'ag-grid-community';
export const allGridColumns: ColDef[] = [
  {
    field: 'serial_number',
    headerName: 'Serial No.',
    width: 100,
  },
  {
    field: 'tag_number',
    headerName: 'Tag No.',
    width: 100,
  },
  {
    field: 'model_number',
    width: 100,
  },
  {
    field: 'valve_type',
    headerName: 'Device Type',
    tooltipField: 'valve_type',
  },
  {
    field: 'manufacturer',
    headerName: 'Valve Manufacturer',
    tooltipField: 'manufacturer',
    width: 300,
  },
  {
    field: 'product_family',
    headerName: 'Valve Product Family',
    tooltipField: 'product_family',
    width: 100,
  },
  {
    field: 'model_series',
    headerName: 'Valve Model Series',
    tooltipField: 'model_series',
  },
  {
    field: 'material',
    headerName: 'Material',
    tooltipField: 'material',
  },
  {
    field: 'valve_ship_date',
    headerName: 'Ship Date',
    tooltipField: 'valve_ship_date',
  },
  {
    field: 'lifecycle_status',
    headerName: 'Lifecycle Status',
    tooltipField: 'lifecycle_status',
  },
  {
    field: 'customer',
    headerName: 'Owner',
    tooltipField: 'customer',
  },
  {
    field: 'customer_nickname',
    headerName: 'Owner Nickname',
    tooltipField: 'customer_nickname',
  },
  {
    field: 'plant',
    headerName: 'Plant',
    tooltipField: 'plant',
  },
  {
    field: 'unit',
    headerName: 'Unit',
    tooltipField: 'unit',
  },
  {
    field: 'location',
    headerName: 'Location',
    tooltipField: 'location',
  },
  {
    field: 'end_user',
    headerName: 'End User',
    tooltipField: 'end_user',
  },
  {
    field: 'sold_to',
    headerName: 'Sold To',
    tooltipField: 'sold_to',
  },
  {
    field: 'project_name',
    headerName: 'Project Name',
    tooltipField: 'project_name',
  },
  {
    field: 'sales_order_number',
    headerName: 'Sales Order No.',
    tooltipField: 'sales_order_number',
  },
  {
    field: 'customer_po_number',
    headerName: 'PO issued to BH',
    tooltipField: 'customer_po_number',
    width: 150,
  },
  {
    field: 'orifice',
    headerName: 'Orifice',
    tooltipField: 'orifice',
  },
  {
    field: 'inletsize',
    headerName: 'Inlet Size',
    tooltipField: 'inletsize',
  },
  {
    field: 'outletsize',
    headerName: 'Outlet Size',
    tooltipField: 'outletsize',
  },
  {
    field: 'inlet_pressure_class',
    headerName: 'Inlet Pressure Class',
    tooltipField: 'inlet_pressure_class',
  },
  {
    field: 'outlet_pressure_class',
    headerName: 'Outlet Pressure Class',
    tooltipField: 'outlet_pressure_class',
  },
  {
    field: 'bellows',
    headerName: 'Bellows',
    tooltipField: 'bellows',
  },
  {
    field: 'seat_type',
    headerName: 'Seat Type',
    tooltipField: 'seat_type',
  },
  {
    field: 'cap_type',
    headerName: 'Cap Type',
    tooltipField: 'cap_type',
  },
  {
    field: 'set_pressure',
    headerName: 'Set Pressure',
    tooltipField: 'set_pressure',
  },
  {
    field: 'back_pressure',
    headerName: 'Back Pressure',
    tooltipField: 'back_pressure',
  },
  {
    field: 'pressure_uom',
    headerName: 'Pressure UOM',
    tooltipField: 'pressure_uom',
  },
  {
    field: 'cdtp',
    headerName: 'CDTP',
    tooltipField: 'cdtp',
  },
  {
    field: 'service',
    headerName: 'PRV Service',
    tooltipField: 'service',
  },
  {
    field: 'service_cv',
    headerName: 'CV Service',
    tooltipField: 'service_cv',
  },
  {
    field: 'process_fluid',
    headerName: 'Process Fluid',
    tooltipField: 'process_fluid',
  },
  {
    field: 'last_service_date',
    headerName: 'Last Service Date',
    tooltipField: 'last_service_date',
  },
  {
    field: 'event_count',
    headerName: '# Events',
    tooltipField: 'event_count',
  },
  {
    field: 'last_event_image_count',
    headerName: '# Images',
    tooltipField: 'last_event_image_count',
  },
  {
    field: 'last_event_part_count',
    headerName: '# Parts',
    tooltipField: 'last_event_part_count',
  },
  {
    field: 'required_capacity',
    headerName: 'Required Capacity',
    tooltipField: 'required_capacity',
  },
  {
    field: 'rated_capacity',
    headerName: 'Rated Capacity',
    tooltipField: 'rated_capacity',
  },
  {
    field: 'capacity_uom',
    headerName: 'Capacity UOM',
    tooltipField: 'capacity_uom',
  },
  {
    field: 'valve_size',
    headerName: 'Inlet Size',
    tooltipField: 'valve_size',
  },
  {
    field: 'cv',
    headerName: 'Cv',
    tooltipField: 'cv',
  },
  {
    field: 'pressure_class',
    headerName: 'Pressure Class',
    tooltipField: 'pressure_class',
  },
  {
    field: 'inlet_size',
    headerName: 'Inlet Size',
    tooltipField: 'inlet_size',
  },
  {
    field: 'outlet_size',
    headerName: 'Outlet Size',
    tooltipField: 'outlet_size',
  },
  {
    field: 'pressure_class',
    headerName: 'Pressure Class',
    tooltipField: 'pressure_class',
  },
  {
    field: 'body_material',
    headerName: 'Body Material',
    tooltipField: 'body_material',
  },
  {
    field: 'positioner_single_double',
    headerName: 'Single/Double Acting',
    tooltipField: 'positioner_single_double',
  },
  {
    field: 'fail_position',
    headerName: 'Fail Position',
    tooltipField: 'fail_position',
  },
  {
    field: 'actuator_model',
    headerName: 'Actuator Model No.',
    tooltipField: 'actuator_model',
  },
  {
    field: 'actuator_manufacturer',
    headerName: 'Actuator Manufacturer',
    tooltipField: 'actuator_manufacturer',
  },
  {
    field: 'actuator_product_family',
    headerName: 'Actuator Product Family',
    tooltipField: 'actuator_product_family',
  },
  {
    field: 'actuator_model_series',
    headerName: 'Actuator Model Series',
    tooltipField: 'actuator_model_series',
  },
  {
    field: 'actuator_serial_number',
    headerName: 'Actuator Serial No.',
    tooltipField: 'actuator_serial_number',
  },
  {
    field: 'actuator_tag_number',
    headerName: 'Actuator Tag No.',
    tooltipField: 'actuator_tag_number',
  },
  {
    field: 'bench_range_min',
    headerName: 'Bench Range Min',
    tooltipField: 'bench_range_min',
  },
  {
    field: 'bench_range_max',
    headerName: 'Bench Range Max',
    tooltipField: 'bench_range_max',
  },
  {
    field: 'positioner_model_number',
    headerName: 'Positioner Model No.',
    tooltipField: 'positioner_model_number',
  },
  {
    field: 'positioner_manufacturer',
    headerName: 'Positioner Manufacturer',
    tooltipField: 'positioner_manufacturer',
  },
  {
    field: 'positioner_product_family',
    headerName: 'Positioner Product Family',
    tooltipField: 'positioner_product_family',
  },
  {
    field: 'positioner_model_series',
    headerName: 'Positioner Model Series',
    tooltipField: 'positioner_model_series',
  },
  {
    field: 'positioner_serial_number',
    headerName: 'Positioner Serial No.',
    tooltipField: 'positioner_serial_number',
  },
  {
    field: 'positioner_tag_number',
    headerName: 'Positioner Tag No.',
    tooltipField: 'positioner_tag_number',
  },
  {
    field: 'positioner_diagnostics_level',
    headerName: 'Diagnostic Level',
    tooltipField: 'positioner_diagnostics_level',
  },
  {
    field: 'positioner_firmware_version',
    headerName: 'Firmware Version',
    tooltipField: 'positioner_firmware_version',
  },
  {
    field: 'supply_pressure',
    headerName: 'Supply Pressure',
    tooltipField: 'supply_pressure',
  },
  {
    field: 'supply_pressure_uom',
    headerName: 'Supply Pressure UOM',
    tooltipField: 'supply_pressure_uom',
  },
  {
    field: 'positioner_hart_version',
    headerName: 'HART Version',
    tooltipField: 'positioner_hart_version',
  },
  {
    field: 'action',
    headerName: 'Action',
    tooltipField: 'action',
  },
  {
    field: 'air_to_close',
    headerName: 'Air To',
    tooltipField: 'air_to_close',
  },
  {
    field: 'sales_rep_name',
    headerName: 'Sales Rep Name',
    tooltipField: 'sales_rep_name',
  },
  {
    field: 'industry',
    headerName: 'Industry',
    tooltipField: 'industry',
  },
  {
    field: 'source_factory',
    headerName: 'Source Factory',
    tooltipField: 'source_factory',
  },
  {
    field: 'end_user_address',
    headerName: 'End User Address',
    tooltipField: 'end_user_address',
  },
  {
    field: 'end_user_country',
    headerName: 'Country',
    tooltipField: 'end_user_country',
  },
  {
    field: 'end_user_region',
    headerName: 'End User Region',
    tooltipField: 'end_user_region',
  },
  {
    field: 'end_user_zip_code',
    headerName: 'Zip Code',
    tooltipField: 'end_user_zip_code',
  },
  {
    field: 'end_user_state',
    headerName: 'State/Province',
    tooltipField: 'end_user_state',
  },
  {
    field: 'ship_to_customer',
    headerName: 'Ship To Customer',
    tooltipField: 'ship_to_customer',
  },
  {
    field: 'ship_to_address',
    headerName: 'Ship To Address',
    tooltipField: 'ship_to_address',
  },
  {
    field: 'ship_to_country',
    headerName: 'Ship To Country',
    tooltipField: 'ship_to_country',
  },
  {
    field: 'ship_to_region',
    headerName: 'Ship To Region',
    tooltipField: 'ship_to_region',
  },
  {
    field: 'ship_to_state',
    headerName: 'Ship To State/Province',
    tooltipField: 'ship_to_state',
  },
  {
    field: 'ship_to_zip_code',
    headerName: 'Ship To Zip Code',
    tooltipField: 'ship_to_zip_code',
  },
  {
    field: 'sold_to_address',
    headerName: 'Sold To Address',
    tooltipField: 'sold_to_address',
  },
  {
    field: 'sold_to_country',
    headerName: 'Sold To Country',
    tooltipField: 'sold_to_country',
  },
  {
    field: 'sold_to_region',
    headerName: 'Sold To Region',
    tooltipField: 'sold_to_region',
  },
  {
    field: 'sold_to_state',
    headerName: 'Sold To State/Province',
    tooltipField: 'sold_to_state',
  },
  {
    field: 'sold_to_zip_code',
    headerName: 'Sold To Zip Code',
    tooltipField: 'sold_to_zip_code',
  },
  {
    field: 'part_number',
    headerName: 'Item Number',
    tooltipField: 'part_number',
  },
  {
    field: 'installation_app',
    headerName: 'Installation Application',
    tooltipField: 'installation_app',
  },
  {
    field: 'inlet_flange_face',
    headerName: 'Inlet Flange Face',
    tooltipField: 'inlet_flange_face',
  },
  {
    field: 'outlet_flange_face',
    headerName: 'Outlet Flange Face',
    tooltipField: 'outlet_flange_face',
  },
  {
    field: 'flow_direction',
    headerName: 'Flow Direction',
    tooltipField: 'flow_direction',
  },
  {
    field: 'flange_face',
    headerName: 'Flange Face',
    tooltipField: 'flange_face',
  },
  {
    field: 'body_size',
    headerName: 'Body Size',
    tooltipField: 'body_size',
  },
  {
    field: 'leakage_class',
    headerName: 'Leakage Class',
    tooltipField: 'leakage_class',
  },
  {
    field: 'relieving_temperature',
    headerName: 'Relieving Temperature',
    tooltipField: 'relieving_temperature',
  },
  {
    field: 'relieving_temperature_uom',
    headerName: 'Relieving Temperature UOM',
    tooltipField: 'relieving_temperature_uom',
  },
  {
    field: 'actuator_size',
    headerName: 'Actuator Size',
    tooltipField: 'actuator_size',
  },
  {
    field: 'spring_type',
    headerName: 'Spring Type',
    tooltipField: 'spring_type',
  },

  {
    field: 'valve_size_regulator',
    headerName: 'Valve Size',
    tooltipField: 'valve_size_regulator',
  },
  {
    field: 'cv_regulator',
    headerName: 'CV',
    tooltipField: 'cv_regulator',
  },
  {
    field: 'cg',
    headerName: 'CG',
    tooltipField: 'cg',
  },
  {
    field: 'c1',
    headerName: 'C1',
    tooltipField: 'c1',
  },
  {
    field: 'end_connection',
    headerName: 'End Connection',
    tooltipField: 'end_connection',
  },
  {
    field: 'body_material_regulator',
    headerName: 'Body Material',
    tooltipField: 'body_material_regulator',
  },
  {
    field: 'service_regulator',
    headerName: 'Regulator Service',
    tooltipField: 'service_regulator',
  },
  {
    field: 'primary_pilot_manufacturer',
    headerName: 'Primary Pilot Manufacturer',
    tooltipField: 'primary_pilot_manufacturer',
  },
  {
    field: 'primary_pilot_product_family',
    headerName: 'Primary Pilot Product Family',
    tooltipField: 'primary_pilot_product_family',
  },
  {
    field: 'primary_pilot_model_series',
    headerName: 'Primary Pilot Model Series',
    tooltipField: 'primary_pilot_model_series',
  },
  {
    field: 'primary_pilot_model_number',
    headerName: 'Primary Pilot Model Number',
    tooltipField: 'primary_pilot_model_number',
  },
  {
    field: 'primary_pilot_body_material',
    headerName: 'Primary Pilot Body Material',
    tooltipField: 'primary_pilot_body_material',
  },
  {
    field: 'primary_pilot_spring_range',
    headerName: 'Primary Pilot Spring Range',
    tooltipField: 'primary_pilot_spring_range',
  },
  {
    field: 'primary_pilot_function',
    headerName: 'Primary Pilot Function',
    tooltipField: 'primary_pilot_function',
  },
  {
    field: 'monitor_pilot_model_number',
    headerName: 'Monitor Pilot Model Number',
    tooltipField: 'monitor_pilot_model_number',
  },
  {
    field: 'monitor_pilot_manufacturer',
    headerName: 'Monitor Pilot Manufacturer',
    tooltipField: 'monitor_pilot_manufacturer',
  },
  {
    field: 'monitor_pilot_product_family',
    headerName: 'Monitor Pilot Product Family',
    tooltipField: 'monitor_pilot_product_family',
  },
  {
    field: 'monitor_pilot_model_series',
    headerName: 'Monitor Pilot Model Series',
    tooltipField: 'monitor_pilot_model_series',
  },
  {
    field: 'monitor_pilot_body_material',
    headerName: 'Monitor Pilot Body Material',
    tooltipField: 'monitor_pilot_body_material',
  },
  {
    field: 'monitor_pilot_spring_range',
    headerName: 'Monitor Pilot Spring Range',
    tooltipField: 'monitor_pilot_spring_range',
  },
  {
    field: 'monitor_pilot_function',
    headerName: 'Monitor Pilot Function',
    tooltipField: 'monitor_pilot_function',
  },
  {
    field: 'restrictor_manufacturer',
    headerName: 'Restrictor Manufacturer',
    tooltipField: 'restrictor_manufacturer',
  },
  {
    field: 'restrictor_product_family',
    headerName: 'Restrictor Product Family',
    tooltipField: 'restrictor_product_family',
  },
  {
    field: 'restrictor_model_series',
    headerName: 'Restrictor Model Series',
    tooltipField: 'restrictor_model_series',
  },
  {
    field: 'restrictor_model_number',
    headerName: 'Restrictor Model Number',
    tooltipField: 'restrictor_model_number',
  },
  {
    field: 'restrictor_body_material',
    headerName: 'Restrictor Body Material',
    tooltipField: 'restrictor_body_material',
  },
  {
    field: 'filter_manufacturer',
    headerName: 'Filter Manufacturer',
    tooltipField: 'filter_manufacturer',
  },
  {
    field: 'filter_product_family',
    headerName: 'Filter Product Family',
    tooltipField: 'filter_product_family',
  },
  {
    field: 'filter_model_series',
    headerName: 'Filter Model Series',
    tooltipField: 'filter_model_series',
  },
  {
    field: 'filter_model_number',
    headerName: 'Filter Model Number',
    tooltipField: 'filter_model_number',
  },
  {
    field: 'filter_body_material',
    headerName: 'Filter Body Material',
    tooltipField: 'filter_body_material',
  },
  {
    field: 'filter_drain_material',
    headerName: 'Filter Drain Material',
    tooltipField: 'filter_drain_material',
  },

  {
    field: 'status_flag',
    headerName: 'Active/Inactive',
    tooltipField: 'status_flag',
  },
];
import { TranslateService } from '@ngx-translate/core';

export async function allColumns(
  transfer: TranslateService
): Promise<ColDef[]> {
  return [
    {
      field: 'serial_number',
      headerName: await transfer.get('serial').toPromise(),
      width: 100,
    },
    {
      field: 'tag_number',
      headerName: await transfer.get('tag').toPromise(),
      width: 100,
    },
    {
      field: 'model_number',
      headerName: await transfer.get('model').toPromise(),
      width: 100,
    },
    {
      field: 'valve_type',
      headerName: await transfer.get('device_type').toPromise(),
      tooltipField: 'valve_type',
    },
    {
      field: 'manufacturer',
      headerName: 'Valve Manufacturer',
      tooltipField: 'manufacturer',
      width: 300,
    },
    {
      field: 'product_family',
      headerName: 'Valve Product Family',
      tooltipField: 'product_family',
      width: 100,
    },
    {
      field: 'model_series',
      headerName: 'Valve Model Series',
      tooltipField: 'model_series',
    },
    {
      field: 'material',
      headerName: 'Material',
      tooltipField: 'material',
    },
    {
      field: 'valve_ship_date',
      headerName: 'Ship Date',
      tooltipField: 'valve_ship_date',
    },
    {
      field: 'lifecycle_status',
      headerName: 'Lifecycle Status',
      tooltipField: 'lifecycle_status',
    },
    {
      field: 'customer',
      headerName: 'Owner',
      tooltipField: 'customer',
    },
    {
      field: 'customer_nickname',
      headerName: 'Owner Nickname',
      tooltipField: 'customer_nickname',
    },
    {
      field: 'plant',
      headerName: 'Plant',
      tooltipField: 'plant',
    },
    {
      field: 'unit',
      headerName: 'Unit',
      tooltipField: 'unit',
    },
    {
      field: 'location',
      headerName: 'Location',
      tooltipField: 'location',
    },
    {
      field: 'end_user',
      headerName: 'End User',
      tooltipField: 'end_user',
    },
    {
      field: 'sold_to',
      headerName: 'Sold To',
      tooltipField: 'sold_to',
    },
    {
      field: 'project_name',
      headerName: 'Project Name',
      tooltipField: 'project_name',
    },
    {
      field: 'sales_order_number',
      headerName: 'Sales Order No.',
      tooltipField: 'sales_order_number',
    },
    {
      field: 'customer_po_number',
      headerName: 'PO issued to BH',
      tooltipField: 'customer_po_number',
      width: 150,
    },
    {
      field: 'orifice',
      headerName: 'Orifice',
      tooltipField: 'orifice',
    },
    {
      field: 'inletsize',
      headerName: 'Inlet Size',
      tooltipField: 'inletsize',
    },
    {
      field: 'outletsize',
      headerName: 'Outlet Size',
      tooltipField: 'outletsize',
    },
    {
      field: 'inlet_pressure_class',
      headerName: 'Inlet Pressure Class',
      tooltipField: 'inlet_pressure_class',
    },
    {
      field: 'outlet_pressure_class',
      headerName: 'Outlet Pressure Class',
      tooltipField: 'outlet_pressure_class',
    },
    {
      field: 'bellows',
      headerName: 'Bellows',
      tooltipField: 'bellows',
    },
    {
      field: 'seat_type',
      headerName: 'Seat Type',
      tooltipField: 'seat_type',
    },
    {
      field: 'cap_type',
      headerName: 'Cap Type',
      tooltipField: 'cap_type',
    },
    {
      field: 'set_pressure',
      headerName: 'Set Pressure',
      tooltipField: 'set_pressure',
    },
    {
      field: 'back_pressure',
      headerName: 'Back Pressure',
      tooltipField: 'back_pressure',
    },
    {
      field: 'pressure_uom',
      headerName: 'Pressure UOM',
      tooltipField: 'pressure_uom',
    },
    {
      field: 'cdtp',
      headerName: 'CDTP',
      tooltipField: 'cdtp',
    },
    {
      field: 'service',
      headerName: 'PRV Service',
      tooltipField: 'service',
    },
    {
      field: 'service_cv',
      headerName: 'CV Service',
      tooltipField: 'service_cv',
    },
    {
      field: 'process_fluid',
      headerName: 'Process Fluid',
      tooltipField: 'process_fluid',
    },
    {
      field: 'last_service_date',
      headerName: 'Last Service Date',
      tooltipField: 'last_service_date',
    },
    {
      field: 'event_count',
      headerName: '# Events',
      tooltipField: 'event_count',
    },
    {
      field: 'last_event_image_count',
      headerName: '# Images',
      tooltipField: 'last_event_image_count',
    },
    {
      field: 'last_event_part_count',
      headerName: '# Parts',
      tooltipField: 'last_event_part_count',
    },
    {
      field: 'required_capacity',
      headerName: 'Required Capacity',
      tooltipField: 'required_capacity',
    },
    {
      field: 'rated_capacity',
      headerName: 'Rated Capacity',
      tooltipField: 'rated_capacity',
    },
    {
      field: 'capacity_uom',
      headerName: 'Capacity UOM',
      tooltipField: 'capacity_uom',
    },
    {
      field: 'valve_size',
      headerName: 'Inlet Size',
      tooltipField: 'valve_size',
    },
    {
      field: 'cv',
      headerName: 'Cv',
      tooltipField: 'cv',
    },
    {
      field: 'pressure_class',
      headerName: 'Pressure Class',
      tooltipField: 'pressure_class',
    },
    {
      field: 'inlet_size',
      headerName: 'Inlet Size',
      tooltipField: 'inlet_size',
    },
    {
      field: 'outlet_size',
      headerName: 'Outlet Size',
      tooltipField: 'outlet_size',
    },
    {
      field: 'pressure_class',
      headerName: 'Pressure Class',
      tooltipField: 'pressure_class',
    },
    {
      field: 'body_material',
      headerName: 'Body Material',
      tooltipField: 'body_material',
    },
    {
      field: 'positioner_single_double',
      headerName: 'Single/Double Acting',
      tooltipField: 'positioner_single_double',
    },
    {
      field: 'fail_position',
      headerName: 'Fail Position',
      tooltipField: 'fail_position',
    },
    {
      field: 'actuator_model',
      headerName: 'Actuator Model No.',
      tooltipField: 'actuator_model',
    },
    {
      field: 'actuator_manufacturer',
      headerName: 'Actuator Manufacturer',
      tooltipField: 'actuator_manufacturer',
    },
    {
      field: 'actuator_product_family',
      headerName: 'Actuator Product Family',
      tooltipField: 'actuator_product_family',
    },
    {
      field: 'actuator_model_series',
      headerName: 'Actuator Model Series',
      tooltipField: 'actuator_model_series',
    },
    {
      field: 'actuator_serial_number',
      headerName: 'Actuator Serial No.',
      tooltipField: 'actuator_serial_number',
    },
    {
      field: 'actuator_tag_number',
      headerName: 'Actuator Tag No.',
      tooltipField: 'actuator_tag_number',
    },
    {
      field: 'bench_range_min',
      headerName: 'Bench Range Min',
      tooltipField: 'bench_range_min',
    },
    {
      field: 'bench_range_max',
      headerName: 'Bench Range Max',
      tooltipField: 'bench_range_max',
    },
    {
      field: 'positioner_model_number',
      headerName: 'Positioner Model No.',
      tooltipField: 'positioner_model_number',
    },
    {
      field: 'positioner_manufacturer',
      headerName: 'Positioner Manufacturer',
      tooltipField: 'positioner_manufacturer',
    },
    {
      field: 'positioner_product_family',
      headerName: 'Positioner Product Family',
      tooltipField: 'positioner_product_family',
    },
    {
      field: 'positioner_model_series',
      headerName: 'Positioner Model Series',
      tooltipField: 'positioner_model_series',
    },
    {
      field: 'positioner_serial_number',
      headerName: 'Positioner Serial No.',
      tooltipField: 'positioner_serial_number',
    },
    {
      field: 'positioner_tag_number',
      headerName: 'Positioner Tag No.',
      tooltipField: 'positioner_tag_number',
    },
    {
      field: 'positioner_diagnostics_level',
      headerName: 'Diagnostic Level',
      tooltipField: 'positioner_diagnostics_level',
    },
    {
      field: 'positioner_firmware_version',
      headerName: 'Firmware Version',
      tooltipField: 'positioner_firmware_version',
    },
    {
      field: 'supply_pressure',
      headerName: 'Supply Pressure',
      tooltipField: 'supply_pressure',
    },
    {
      field: 'supply_pressure_uom',
      headerName: 'Supply Pressure UOM',
      tooltipField: 'supply_pressure_uom',
    },
    {
      field: 'positioner_hart_version',
      headerName: 'HART Version',
      tooltipField: 'positioner_hart_version',
    },
    {
      field: 'action',
      headerName: 'Action',
      tooltipField: 'action',
    },
    {
      field: 'air_to_close',
      headerName: 'Air To',
      tooltipField: 'air_to_close',
    },
    {
      field: 'sales_rep_name',
      headerName: 'Sales Rep Name',
      tooltipField: 'sales_rep_name',
    },
    {
      field: 'industry',
      headerName: 'Industry',
      tooltipField: 'industry',
    },
    {
      field: 'source_factory',
      headerName: 'Source Factory',
      tooltipField: 'source_factory',
    },
    {
      field: 'end_user_address',
      headerName: 'End User Address',
      tooltipField: 'end_user_address',
    },
    {
      field: 'end_user_country',
      headerName: 'Country',
      tooltipField: 'end_user_country',
    },
    {
      field: 'end_user_region',
      headerName: 'End User Region',
      tooltipField: 'end_user_region',
    },
    {
      field: 'end_user_zip_code',
      headerName: 'Zip Code',
      tooltipField: 'end_user_zip_code',
    },
    {
      field: 'end_user_state',
      headerName: 'State/Province',
      tooltipField: 'end_user_state',
    },
    {
      field: 'ship_to_customer',
      headerName: 'Ship To Customer',
      tooltipField: 'ship_to_customer',
    },
    {
      field: 'ship_to_address',
      headerName: 'Ship To Address',
      tooltipField: 'ship_to_address',
    },
    {
      field: 'ship_to_country',
      headerName: 'Ship To Country',
      tooltipField: 'ship_to_country',
    },
    {
      field: 'ship_to_region',
      headerName: 'Ship To Region',
      tooltipField: 'ship_to_region',
    },
    {
      field: 'ship_to_state',
      headerName: 'Ship To State/Province',
      tooltipField: 'ship_to_state',
    },
    {
      field: 'ship_to_zip_code',
      headerName: 'Ship To Zip Code',
      tooltipField: 'ship_to_zip_code',
    },
    {
      field: 'sold_to_address',
      headerName: 'Sold To Address',
      tooltipField: 'sold_to_address',
    },
    {
      field: 'sold_to_country',
      headerName: 'Sold To Country',
      tooltipField: 'sold_to_country',
    },
    {
      field: 'sold_to_region',
      headerName: 'Sold To Region',
      tooltipField: 'sold_to_region',
    },
    {
      field: 'sold_to_state',
      headerName: 'Sold To State/Province',
      tooltipField: 'sold_to_state',
    },
    {
      field: 'sold_to_zip_code',
      headerName: 'Sold To Zip Code',
      tooltipField: 'sold_to_zip_code',
    },
    {
      field: 'part_number',
      headerName: 'Item Number',
      tooltipField: 'part_number',
    },
    {
      field: 'installation_app',
      headerName: 'Installation Application',
      tooltipField: 'installation_app',
    },
    {
      field: 'inlet_flange_face',
      headerName: 'Inlet Flange Face',
      tooltipField: 'inlet_flange_face',
    },
    {
      field: 'outlet_flange_face',
      headerName: 'Outlet Flange Face',
      tooltipField: 'outlet_flange_face',
    },
    {
      field: 'flow_direction',
      headerName: 'Flow Direction',
      tooltipField: 'flow_direction',
    },
    {
      field: 'flange_face',
      headerName: 'Flange Face',
      tooltipField: 'flange_face',
    },
    {
      field: 'body_size',
      headerName: 'Body Size',
      tooltipField: 'body_size',
    },
    {
      field: 'leakage_class',
      headerName: 'Leakage Class',
      tooltipField: 'leakage_class',
    },
    {
      field: 'relieving_temperature',
      headerName: 'Relieving Temperature',
      tooltipField: 'relieving_temperature',
    },
    {
      field: 'relieving_temperature_uom',
      headerName: 'Relieving Temperature UOM',
      tooltipField: 'relieving_temperature_uom',
    },
    {
      field: 'actuator_size',
      headerName: 'Actuator Size',
      tooltipField: 'actuator_size',
    },
    {
      field: 'spring_type',
      headerName: 'Spring Type',
      tooltipField: 'spring_type',
    },

    {
      field: 'valve_size_regulator',
      headerName: 'Valve Size',
      tooltipField: 'valve_size_regulator',
    },
    {
      field: 'cv_regulator',
      headerName: 'CV',
      tooltipField: 'cv_regulator',
    },
    {
      field: 'cg',
      headerName: 'CG',
      tooltipField: 'cg',
    },
    {
      field: 'c1',
      headerName: 'C1',
      tooltipField: 'c1',
    },
    {
      field: 'end_connection',
      headerName: 'End Connection',
      tooltipField: 'end_connection',
    },
    {
      field: 'body_material_regulator',
      headerName: 'Body Material',
      tooltipField: 'body_material_regulator',
    },
    {
      field: 'service_regulator',
      headerName: 'Regulator Service',
      tooltipField: 'service_regulator',
    },
    {
      field: 'primary_pilot_manufacturer',
      headerName: 'Primary Pilot Manufacturer',
      tooltipField: 'primary_pilot_manufacturer',
    },
    {
      field: 'primary_pilot_product_family',
      headerName: 'Primary Pilot Product Family',
      tooltipField: 'primary_pilot_product_family',
    },
    {
      field: 'primary_pilot_model_series',
      headerName: 'Primary Pilot Model Series',
      tooltipField: 'primary_pilot_model_series',
    },
    {
      field: 'primary_pilot_model_number',
      headerName: 'Primary Pilot Model Number',
      tooltipField: 'primary_pilot_model_number',
    },
    {
      field: 'primary_pilot_body_material',
      headerName: 'Primary Pilot Body Material',
      tooltipField: 'primary_pilot_body_material',
    },
    {
      field: 'primary_pilot_spring_range',
      headerName: 'Primary Pilot Spring Range',
      tooltipField: 'primary_pilot_spring_range',
    },
    {
      field: 'primary_pilot_function',
      headerName: 'Primary Pilot Function',
      tooltipField: 'primary_pilot_function',
    },
    {
      field: 'monitor_pilot_model_number',
      headerName: 'Monitor Pilot Model Number',
      tooltipField: 'monitor_pilot_model_number',
    },
    {
      field: 'monitor_pilot_manufacturer',
      headerName: 'Monitor Pilot Manufacturer',
      tooltipField: 'monitor_pilot_manufacturer',
    },
    {
      field: 'monitor_pilot_product_family',
      headerName: 'Monitor Pilot Product Family',
      tooltipField: 'monitor_pilot_product_family',
    },
    {
      field: 'monitor_pilot_model_series',
      headerName: 'Monitor Pilot Model Series',
      tooltipField: 'monitor_pilot_model_series',
    },
    {
      field: 'monitor_pilot_body_material',
      headerName: 'Monitor Pilot Body Material',
      tooltipField: 'monitor_pilot_body_material',
    },
    {
      field: 'monitor_pilot_spring_range',
      headerName: 'Monitor Pilot Spring Range',
      tooltipField: 'monitor_pilot_spring_range',
    },
    {
      field: 'monitor_pilot_function',
      headerName: 'Monitor Pilot Function',
      tooltipField: 'monitor_pilot_function',
    },
    {
      field: 'restrictor_manufacturer',
      headerName: 'Restrictor Manufacturer',
      tooltipField: 'restrictor_manufacturer',
    },
    {
      field: 'restrictor_product_family',
      headerName: 'Restrictor Product Family',
      tooltipField: 'restrictor_product_family',
    },
    {
      field: 'restrictor_model_series',
      headerName: 'Restrictor Model Series',
      tooltipField: 'restrictor_model_series',
    },
    {
      field: 'restrictor_model_number',
      headerName: 'Restrictor Model Number',
      tooltipField: 'restrictor_model_number',
    },
    {
      field: 'restrictor_body_material',
      headerName: 'Restrictor Body Material',
      tooltipField: 'restrictor_body_material',
    },
    {
      field: 'filter_manufacturer',
      headerName: 'Filter Manufacturer',
      tooltipField: 'filter_manufacturer',
    },
    {
      field: 'filter_product_family',
      headerName: 'Filter Product Family',
      tooltipField: 'filter_product_family',
    },
    {
      field: 'filter_model_series',
      headerName: 'Filter Model Series',
      tooltipField: 'filter_model_series',
    },
    {
      field: 'filter_model_number',
      headerName: 'Filter Model Number',
      tooltipField: 'filter_model_number',
    },
    {
      field: 'filter_body_material',
      headerName: 'Filter Body Material',
      tooltipField: 'filter_body_material',
    },
    {
      field: 'filter_drain_material',
      headerName: 'Filter Drain Material',
      tooltipField: 'filter_drain_material',
    },

    {
      field: 'status_flag',
      headerName: 'Active/Inactive',
      tooltipField: 'status_flag',
    },
  ];
}
