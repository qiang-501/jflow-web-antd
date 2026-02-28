# Workflow History Tracking Implementation

## Overview

This implementation provides comprehensive audit trail functionality for all workflow and workflow form data changes. Every modification is tracked with complete before/after snapshots and field-level change details.

## Features

### 1. Change Type Tracking

All changes are categorized by type:

- `status_change` - Workflow status transitions
- `form_data_create` - Initial form data submission
- `form_data_update` - Form data modifications
- `workflow_update` - Workflow field updates
- `workflow_create` - New workflow creation
- `workflow_delete` - Workflow deletion

### 2. Field-Level Change Tracking

For every change, the system records:

- **Field name**: The property that changed
- **Old value**: Previous value
- **New value**: Updated value
- **Field label**: Human-readable field name

Example:

```json
{
  "field": "status",
  "oldValue": "draft",
  "newValue": "in_progress",
  "fieldLabel": "Status"
}
```

### 3. Complete Data Snapshots

For complex changes (especially form data), the system stores:

- **oldData**: Complete snapshot before the change
- **newData**: Complete snapshot after the change

This enables:

- Full audit trail visibility
- Point-in-time data restoration
- Detailed change comparison

## Database Schema

### workflow_history Table

```sql
CREATE TABLE workflow_history (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflows(id),
  change_type change_type_enum DEFAULT 'workflow_update',
  action VARCHAR(100) NOT NULL,
  comment TEXT,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  field_changes JSONB,  -- Array of field-level changes
  old_data JSONB,       -- Complete snapshot before change
  new_data JSONB,       -- Complete snapshot after change
  performed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Methods

### WorkflowsService Methods

#### create(createWorkflowDto)

- Records `WORKFLOW_CREATE` in history
- Stores complete new workflow data

#### update(id, updateWorkflowDto)

- Compares old vs new workflow fields
- Records `WORKFLOW_UPDATE` with field-level changes
- Includes status change tracking

#### remove(id)

- Records `WORKFLOW_DELETE` with final state
- Preserves complete workflow data before deletion

#### saveFormData(createFormDataDto)

- For new form data: Records `FORM_DATA_CREATE`
- For existing form data: Records `FORM_DATA_UPDATE` with field diffs

#### updateFormData(workflowId, updateFormDataDto)

- Compares old vs new form data (JSONB comparison)
- Records field-level changes for each modified field

#### deleteFormData(workflowId, performedBy)

- Records form data deletion with final state

### Helper Methods

#### computeFieldChanges(oldEntity, updates)

Computes field-level differences for workflow entity updates.

#### computeFormDataChanges(oldFormData, newFormData)

Computes field-level differences for JSONB form data.

#### sanitizeData(entity)

Removes circular references and relation objects for safe JSON storage.

#### recordHistory(data)

Central method for creating history records.

## Query Examples

### Get all form data changes for a workflow

```typescript
const history = await workflowsService.getHistory(workflowId);
const formChanges = history.filter((h) => h.changeType === ChangeType.FORM_DATA_CREATE || h.changeType === ChangeType.FORM_DATA_UPDATE);
```

### Find who changed specific fields

```sql
SELECT * FROM workflow_history
WHERE workflow_id = 123
AND field_changes @> '[{"field": "status"}]'::jsonb;
```

### Get complete audit trail with field-level details

```typescript
const history = await workflowsService.getHistory(workflowId);
history.forEach((record) => {
  console.log(`${record.action} by user ${record.performedBy}`);
  console.log(`Changed fields:`, record.fieldChanges);
});
```

## Migration

Run the migration script to add new columns:

```bash
# Apply migration
psql -U your_user -d your_database -f server/src/database/migrations/002_enhance_workflow_history.sql
```

The migration:

- Creates `change_type_enum` type
- Adds `change_type`, `field_changes`, `old_data`, `new_data` columns
- Creates indexes for performance
- Adds column documentation

## Usage Examples

### Frontend Query Example

```typescript
// Get workflow history
const response = await this.http.get(`/api/workflows/${workflowId}/history`);
const history = response.data;

// Display changes
history.forEach((record) => {
  if (record.fieldChanges?.length > 0) {
    record.fieldChanges.forEach((change) => {
      console.log(`${change.fieldLabel}: ${change.oldValue} → ${change.newValue}`);
    });
  }
});
```

### Restore Previous Version (Future Feature)

```typescript
// Get specific history record
const historyRecord = await workflowHistoryRepository.findOne(historyId);

// Restore old data
if (historyRecord.oldData) {
  await workflowsService.update(historyRecord.workflowId, historyRecord.oldData);
}
```

## Performance Considerations

1. **Indexes**: Added indexes on `change_type` and `(workflow_id, created_at)`
2. **JSONB**: PostgreSQL JSONB type provides efficient storage and querying
3. **Sanitization**: `sanitizeData()` removes circular references to prevent bloat
4. **Selective Storage**: Only changed fields stored in `fieldChanges` array

## Future Enhancements

1. **Rollback API**: Add endpoint to restore previous versions
2. **Change Comparison UI**: Visual diff viewer for form changes
3. **Advanced Filters**: Filter history by change type, date range, user
4. **Change Notifications**: Alert users when specific fields change
5. **Retention Policy**: Archive old history records after configurable period

## Testing

Test all CRUD operations to ensure history tracking:

```bash
# Create workflow
POST /api/workflows
# Check history contains WORKFLOW_CREATE

# Update workflow
PATCH /api/workflows/:id
# Check history contains WORKFLOW_UPDATE with field changes

# Submit form data
POST /api/workflows/:id/form-data
# Check history contains FORM_DATA_CREATE

# Update form data
PATCH /api/workflows/:id/form-data
# Check history contains FORM_DATA_UPDATE with field diffs
```

## Troubleshooting

### History not being created

- Check `performedBy` is provided (defaults to 1)
- Verify workflow exists before operation
- Check database constraints

### Field changes empty

- Ensure data actually changed (uses JSON comparison)
- Check `computeFieldChanges` or `computeFormDataChanges` logic

### Performance issues

- Add indexes as needed
- Consider archiving old history records
- Use query filters to limit result sets
