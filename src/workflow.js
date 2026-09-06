// Shared mapping from SchoolDesk's real backend states to the two lifecycle
// trackers shown in the UI (see StageStepper.vue). Kept in one place so the
// dashboard, event details, and published card never invent a status that
// doesn't exist in app/core/database.py's event_status / join_request enums.
//
// IMPORTANT -- this intentionally does NOT follow the brief's literal
// "Draft -> Proposed -> Finance/Pricing -> Published" 4-label copy. The real
// `event_status` enum has 7 values (draft, resource_planning, proposed,
// approved, finance_approval, final_review, published), but the actual
// transition logic implemented in TenantService.transition_event only wires
// up draft -> proposed -> approved -> published (see tenant/service.py
// TRANSITIONS). resource_planning / finance_approval / final_review are
// real, reachable statuses (event_teacher resource planning, and direct
// admin/manager status edits) but not part of that one transition table, so
// they're grouped into the neighboring visual phase rather than invented as
// separate top-level steps. There is also no "finance" role in practice --
// school_admin/manager perform pricing -- so the "Finance" phase names them,
// not a role that isn't real here.

export const INTERNAL_PHASES = [
  { key: 'draft', label: 'Draft' },
  { key: 'review', label: 'Review' },
  { key: 'finance', label: 'Finance & Approval' },
  { key: 'published', label: 'Published' },
];

export function internalStageFor(status) {
  switch (status) {
    case 'draft':
      return { index: 0, subLabel: 'Draft', holder: 'Teacher', locked: false };
    case 'resource_planning':
      return { index: 1, subLabel: 'Resource planning', holder: 'Event Teacher', locked: true };
    case 'proposed':
      return { index: 1, subLabel: 'Proposed — awaiting manager review', holder: 'Manager', locked: true };
    case 'approved':
      return { index: 2, subLabel: 'Approved — pricing & resources editable', holder: 'Manager · School Admin', locked: false };
    case 'finance_approval':
      return { index: 2, subLabel: 'Finance approval', holder: 'Manager · School Admin', locked: true };
    case 'final_review':
      return { index: 2, subLabel: 'Final review', holder: 'Manager · School Admin', locked: true };
    case 'published':
      return { index: 3, subLabel: 'Published', holder: '', locked: true };
    default:
      return { index: 0, subLabel: status || 'Draft', holder: 'Teacher', locked: false };
  }
}

export const ENROLLMENT_STEPS = [
  { key: 'requested_by_student', label: 'Requested' },
  { key: 'approved_by_parent', label: 'Parent' },
  { key: 'approved_by_teacher', label: 'Teacher' },
];

export function enrollmentStageFor(state) {
  switch (state) {
    case 'requested_by_student':
      return { index: 0, subLabel: 'Awaiting parent' };
    case 'approved_by_parent':
      return { index: 1, subLabel: 'Awaiting teacher' };
    case 'approved_by_teacher':
      return { index: 2, subLabel: 'Confirmed' };
    case 'rejected_by_parent':
      return { index: 0, terminal: 'Rejected by parent' };
    case 'rejected_by_teacher':
      return { index: 1, terminal: 'Rejected by teacher' };
    default:
      return { index: 0, subLabel: state || 'Not enrolled' };
  }
}
