import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import StructureImportModal from '../components/StructureImportModal.vue';
import { apiPreviewStructureImport, apiCommitStructureImport } from '../api';
import { useStructureStore } from '../store';

vi.mock('../api', () => ({
  apiPreviewStructureImport: vi.fn(),
  apiCommitStructureImport: vi.fn(),
}));

vi.mock('../store', () => ({
  useStructureStore: vi.fn(),
}));

const mountOptions = {
  props: { modelValue: true },
  global: {
    stubs: {
      Upload: true, Download: true, X: true, Loader2: true, FileSearch: true,
      CheckCircle2: true, XCircle: true, AlertTriangle: true, AlertCircle: true,
    },
  },
};

describe('StructureImportModal.vue', () => {
  let mockStructureStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStructureStore = { reloadLiveStructure: vi.fn().mockResolvedValue() };
    useStructureStore.mockReturnValue(mockStructureStore);
  });

  const selectFile = async (wrapper, file) => {
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', { value: [file], writable: false });
    await input.trigger('change');
  };

  it('does not render when modelValue is false', () => {
    const wrapper = mount(StructureImportModal, { ...mountOptions, props: { modelValue: false } });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('runs preview after a file is selected and renders per-row results', async () => {
    apiPreviewStructureImport.mockResolvedValue({
      filename: 'grades.csv',
      total_rows: 2,
      valid_rows: 1,
      error_rows: 1,
      rows: [
        { row_number: 2, grade_name: 'Grade 7', class_name: 'Grade 7 - A', action: 'create_grade+create_class', status: 'valid', errors: [], warnings: [] },
        { row_number: 3, grade_name: '', class_name: null, action: 'skipped', status: 'error', errors: ['grade_name is required'], warnings: [] },
      ],
    });

    const wrapper = mount(StructureImportModal, mountOptions);
    const file = new File(['grade_name,class_name\nGrade 7,Grade 7 - A\n'], 'grades.csv', { type: 'text/csv' });
    await selectFile(wrapper, file);

    await wrapper.find('button[type="button"].btn-primary, .btn-primary').trigger('click');
    await flushPromises();

    expect(apiPreviewStructureImport).toHaveBeenCalledWith(file);
    const html = wrapper.html();
    expect(html).toContain('1 valid');
    expect(html).toContain('1 with errors');
    expect(html).toContain('Grade 7');
    expect(html).toContain('grade_name is required');
  });

  it('commits the same file, refreshes the structure store, and emits imported + closes', async () => {
    apiPreviewStructureImport.mockResolvedValue({
      filename: 'grades.csv',
      total_rows: 1,
      valid_rows: 1,
      error_rows: 0,
      rows: [
        { row_number: 2, grade_name: 'Grade 7', class_name: 'Grade 7 - A', action: 'create_grade+create_class', status: 'valid', errors: [], warnings: [] },
      ],
    });
    const commitResult = {
      filename: 'grades.csv', total_rows: 1, applied_rows: 1, skipped_rows: 0,
      created_grades: 1, updated_grades: 0, created_classes: 1, updated_classes: 0,
      row_results: [],
    };
    apiCommitStructureImport.mockResolvedValue(commitResult);

    const wrapper = mount(StructureImportModal, mountOptions);
    const file = new File(['grade_name,class_name\nGrade 7,Grade 7 - A\n'], 'grades.csv', { type: 'text/csv' });
    await selectFile(wrapper, file);
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    // Now on the preview screen -- click Confirm Import.
    const confirmBtn = wrapper.findAll('button').find(b => b.text().includes('Confirm Import'));
    expect(confirmBtn).toBeTruthy();
    await confirmBtn.trigger('click');
    await flushPromises();

    expect(apiCommitStructureImport).toHaveBeenCalledWith(file);
    expect(mockStructureStore.reloadLiveStructure).toHaveBeenCalled();
    expect(wrapper.emitted('imported')).toBeTruthy();
    expect(wrapper.emitted('imported')[0][0]).toEqual(commitResult);
    // handleClose runs after a successful commit.
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
  });

  it('shows an error message and does not close when preview fails', async () => {
    apiPreviewStructureImport.mockRejectedValue(new Error('Unsupported file type'));

    const wrapper = mount(StructureImportModal, mountOptions);
    const file = new File(['bad'], 'grades.pdf', { type: 'application/pdf' });
    await selectFile(wrapper, file);
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Unsupported file type');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });
});
