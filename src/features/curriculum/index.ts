export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";
export type {
  DegreeLevelType,
  ProgramPlanType,
  ProgramStatusType,
  CurriculumCategory,
  StudyPlanSemester,
  CreateProgramInput,
  UpdateProgramInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "./_internal/validations";
export type { CurriculumProgramDto, DepartmentDto } from "./_internal/services";
export {
  getAdminProgramsAction,
  getDepartmentsAction,
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
  toggleProgramStatusAction,
  listAdminDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
  toggleDepartmentStatusAction,
} from "./_internal/actions";
